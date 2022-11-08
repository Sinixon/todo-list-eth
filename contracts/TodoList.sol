// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.17;

contract TodoList {
    // Taskcount, used as an ID value
    uint256 public taskCount = 0;

    // Structure of a task. This structure represents what a task consists of
    struct Task {
        uint256 id;
        string task;
        bool isDone;
    }

    // Give an address to the mapping of Users and it will give you back an array of the Tasks that belongs to that specific user
    // See this is a key-value pair
    mapping(address => Task[]) private Users;

    // Event will create logging for external subscribers
    // Event TaskCreated
    event TaskCreated(uint256 id, string task, bool isDone);

    // Event TaskCompleted
    event TaskCompleted(uint256 id, bool isDone);

    // Function to create a task. Param _task means it is a variable from local memory q
    // calldata means it is non-modifiable variable
    function createTask(string calldata _task) external {
        // Push a new task into the Users mapping
        // Notice the msg.sender. This will make sure we add the Task to the correct address of the account the call is coming from
        Users[msg.sender].push(
            Task({id: taskCount, task: _task, isDone: false})
        );
        // Emit the event TaskCreated so we know the transaction went through
        emit TaskCreated(taskCount, _task, false);

        // Increment the taskCount (ID) by one
        taskCount++;
    }

    // Function to get a Task. Param _taskIndex is a memory variable and corressponds to the ID of the task
    // Return value is a Task object as a memory variable
    function getTask(uint256 _taskIndex) external view returns (Task memory) {
        // We have to go into storage variables because the Task is saved on the blockchain
        // Accessing the mapping function Users. Using the address of the user making the call with the corresponding ID (_taskIndex)

        //CHECK DIE STORAGE NOG EVEN
        Task storage task = Users[msg.sender][_taskIndex];
        return task;
    }

    // Function toggleCompleted to check a task off. Param _taskIndex is a memory variable and cannot be a negative integer
    function toggleCompleted(uint256 _taskIndex) external {
        // Access the mapping User giving the address of the current User making the call and the corresponding ID
        // Modifying the isDone boolean attribute of the struct we created to true
        Users[msg.sender][_taskIndex].isDone = true;

        // Emit the event taskCompleted so we know the transaction went through
        emit TaskCompleted(_taskIndex, true);
    }

    // Function getTaskCount will return a uint256 as the taskCount value
    function getTaskCount() external view returns (uint256) {
        // What we return is the length of the Users mapping function for the address that made the call
        return Users[msg.sender].length;
    }
}
