//This file describes my JavaScript App that 'talks' to the blockchain

// Creating a new JS object called App
App = {
    // Set the variable loading to false and start with an empty Array for the contracts
    loading: false,
    contracts: {},

    // Load function to start a couple of async functions
    load: async () => {
        await App.loadWeb3()
        await App.loadAccount()
        await App.loadContract()
        await App.render()
    },

    // https://medium.com/metamask/https-medium-com-metamask-breaking-change-injecting-web3-7722797916a8
    // Gotten this code from the source link above. This is to connect with metamask. Standard piece of code.
    loadWeb3: async () => {
        // Modern dapp browsers...
        if (window.ethereum) {
            web3 = new Web3(web3.currentProvider);
            try {
                //Request account access
                await window.ethereum.request({ method: "eth_requestAccounts" });
            } catch (error) {
                // User denied account access...
                console.error("User denied account access");
            }
            App.web3Provider = web3.currentProvider;
            console.log("modern dapp browser");
        }
        // Legacy dapp browsers...
        else if (window.web3) {
            App.web3Provider = window.web3.currentProvider;
            console.log("legacy dapp browser");
        }
        // if no injected web3 instance is detected, fall back to Ganache
        else {
            App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
        }
        web3 = new Web3(App.web3Provider);

    },

    // loadAccount async function to load the current account and set App.account to the current account
    loadAccount: async () => {
        // Set the current blockchain account
        let accounts = await web3.eth.getAccounts();

        App.account = accounts[0];

        console.log(accounts[0]);
    },

    // loadContract async function to load the smart contract on the blockchain
    loadContract: async () => {
        // Creating a variable of the contract json deployment file
        const todoList = await $.getJSON('TodoList.json')
        // Let the TruffleContract library make an actual TruffleContract of the todoList variable
        // TruffleContract allows you to call functions on the contract and more
        App.contracts.TodoList = TruffleContract(todoList)
        App.contracts.TodoList.setProvider(App.web3Provider)

        // Getting a deployed copy of the smart contract
        App.todoList = await App.contracts.TodoList.deployed()

    },

    // The render function will render out some info we want and also provide settings for the rendering of elements
    render: async () => {
        // Prevent double render
        if (App.loading) {
            return
        }

        console.log('Setloading function')

        // Update app loading state
        App.setLoading(true)

        // Render Account
        $('#account').html(App.account)

        // Render Tasks
        await App.renderTasks()

        // Update loading state
        App.setLoading(false)
    },

    // Function renderTasks to render all the tasks on the screen 
    renderTasks: async () => {
        // Load the total task count from the blockchain into a variable
        // Notice the from: App.account as a reference to the current account that is accessing this function
        // Because the Users mapping in the smart contract needs to have a msg.sender value
        const taskCount = await App.todoList.getTaskCount({ from: App.account })

        console.log(taskCount)

        //Render Tasks to html using jQuery
        $('#taskCount').html(taskCount.toNumber() + ' Tasks')

        // Create a variable for the class taskTemplate in the html
        const $taskTemplate = $('.taskTemplate')

        // Creating a web3.eth.Contract object
        // The variables networkId, todoList and networkData are needed to create the object
        const networkId = await web3.eth.net.getId()
        const todoList = await $.getJSON('TodoList.json')
        const networkData = todoList.networks[networkId]

        // Only if networkData returns true create the web3.eth.Contract object. If false we don't have a connection
        if (networkData) {

            // Create the web3.eth.Contract object
            const todoListContract = new web3.eth.Contract(todoList.abi, networkData.address)

            // Bind it with the App object so we can use it everywhere in this JS file
            App.todoListContract = todoListContract;

            // !!!!
            // The reason why we need this web3.eth.Contract object is because this can make user specific calls to the smart contract
            // I've tried accessing the smart contract functions createTask and toggleCompleted without the object but it doesn't work
            // Seems like this is the only workaround for now.

            // Render out each task with a new task template
            // Because our taskCount value in our smart contract starts with 0 we want to start at 0 here as well
            for (var i = 0; i < taskCount; i++) {
                // Fetch the task data from the blockchain
                // The task variable will represent a array of the task (each value in the array is based on the Struct of the contract)
                const task = await App.todoList.getTask(i, { from: App.account });

                console.log(task);

                // Assigning the values of the task array to variables (start at index 0 of the array, use Struct as reference)
                const taskId = task[0]
                const taskContent = task[1]
                const taskCompleted = task[2]

                // Create the html for the task
                // At line 103 we created a variable for the current taskTemplate in the html
                // We will clone the taskTemplate here and add the new task to it
                const $newTaskTemplate = $taskTemplate.clone()

                // Find the class content in the html and show the taskContent to the user
                $newTaskTemplate.find('.content').html(taskContent)

                // Find the input html tag in the html and do the following:
                // .prop means setting a value basically so we are setting a value name to taskId and also the value checked to taskCompleted
                $newTaskTemplate.find('input')
                    .prop('name', taskId) // Represents the taskId of the task
                    .prop('checked', taskCompleted) // Represents the state of the task 
                    .on('click', App.toggleCompleted) // Represents an on-click function to trigger the toggleCompleted function

                // Put the task in the correct list. If taskCompleted = true then add to the html with the ID completedTaskList
                // Else add to the html with ID taskList
                if (taskCompleted) {
                    $('#completedTaskList').append($newTaskTemplate)
                } else {
                    $('#taskList').append($newTaskTemplate)
                }

                // Show the newly created taskTemplate to the user
                $newTaskTemplate.show()
            }
        }
    },

    // Function to create a task
    createTask: async () => {
        // First whenever we call this function we want to set the state of setLoading to true
        App.setLoading(true)

        // Fetching the value of the user input of the html tag with ID newTask to the variable content
        const content = $('#newTask').val()

        // Creating a new task using the web3.eth.Contract we created earlier. Giving the content variable as incoming parameter
        await App.todoListContract.methods.createTask(content).send({ from: App.account });

        // Reload the window so the task will render and be visible to the user
        window.location.reload()
    },

    // Function toggleCompleted to complete a task. Event e is given as a parameter because this is an on-click event
    toggleCompleted: async (e) => {
        // First whenever we call this function we want to set the state of setLoading to true
        App.setLoading(true)

        // The event has a value name that I can access to receive the taskId of the clicked task. Storing this is variable taskId
        const taskId = e.target.name

        // Using the toggleCompleted function with the taskId parameter to set the state of the task to completed
        await App.todoListContract.methods.toggleCompleted(taskId).send({ from: App.account });

        // Reload the window so the task will render and be visible to the user
        window.location.reload()
    },


    // setLoading function that takes in a boolean as an incoming parameter
    setLoading: (boolean) => {
        // Set the state of App.loading to the incoming parameter 
        App.loading = boolean

        // Use jQuery to access html elements loader and content
        const loader = $('#loader')
        const content = $('#content')
        const taskList = $('#taskList')
        const completedTaskList = $('#completedTaskList')
        const plusButton = $('#fab')

        // If incoming parameter is true then show the loader and hide the content & lists else show the content & lists hide loader
        if (boolean) {
            content.hide()
            taskList.hide()
            completedTaskList.hide()
            plusButton.removeAttr('data-target')
            loader.show()
        } else {
            content.show()
            taskList.removeAttr('hidden')
            taskList.show()
            completedTaskList.removeAttr('hidden')
            completedTaskList.show()
            plusButton.attr('data-target', '#add-task-container')
            loader.hide()
        }
    }
}

// Function to start the App.load function whenever the project loads
$(() => {
    $(window).load(() => {
        App.load()
    })
})