const TodoList = artifacts.require('./TodoList.sol')

contract('TodoList', (accounts) => {
    before(async () => {
        this.todoList = await TodoList.deployed()
    })

    it('Test deployment', async () => {
        const address = await this.todoList.address
        assert.notEqual(address, 0x0)
        assert.notEqual(address, '')
        assert.notEqual(address, null)
        assert.notEqual(address, undefined)
    })

    it('Test function createTask and validate', async () => {
        const result = await this.todoList.createTask('A new task')
        const taskCount = await this.todoList.getTaskCount()
        assert.equal(taskCount.toNumber(), 1)
        const event = result.logs[0].args
        assert.equal(event.id.toNumber(), 0)
        assert.equal(event.task, 'A new task')
        assert.equal(event.isDone, false)
    })

    it('Test function getTask and validate', async () => {
        const address = await this.todoList.address
        const taskCount = await this.todoList.getTaskCount()
        const task = await this.todoList.getTask(0, { from: accounts[0] })
        assert.equal(task.id, 0)
        assert.equal(task.task, 'A new task')
        assert.equal(task.isDone, false)
        assert.equal(taskCount.toNumber(), 1)
    })


    it('Test function toggleCompleted and validate', async () => {
        const result = await this.todoList.toggleCompleted(0)
        const task = await this.todoList.getTasks(0, { from: accounts[0] })
        assert.equal(task.isDone, true)
        const event = result.logs[0].args
        assert.equal(event.id, 0)
        assert.equal(event.isDone, true)
    })
})