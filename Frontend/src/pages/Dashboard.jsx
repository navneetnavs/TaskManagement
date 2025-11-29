import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getTasks, createTask, updateTask, deleteTask } from '../services/api';
import DeleteConfirmation from '../components/DeleteConfirmation';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ title: '', description: '', status: 'pending' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await getTasks();
        setTasks(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch tasks');
        setLoading(false);
      }
    };

    if (user) {
      fetchTasks();
    }
  }, [user]);

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) {
      setError('Task title is required');
      return;
    }

    try {
      const response = await createTask(newTask);
      setTasks([response.data, ...tasks]);
      setNewTask({ title: '', description: '', status: 'pending' });
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add task');
    }
  };

  const handleDeleteClick = (taskId, taskTitle) => {
    setTaskToDelete({ id: taskId, title: taskTitle });
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!taskToDelete) return;
    
    try {
      await deleteTask(taskToDelete.id);
      setTasks(tasks.filter(task => task._id !== taskToDelete.id));
      setShowDeleteModal(false);
      setTaskToDelete(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete task');
      setShowDeleteModal(false);
      setTaskToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setTaskToDelete(null);
  };

  const toggleTaskStatus = async (task) => {
    try {
      const newStatus = task.status === 'completed' ? 'pending' : 'completed';
      const response = await updateTask(task._id, { ...task, status: newStatus });
      setTasks(tasks.map(t => 
        t._id === task._id ? response.data : t
      ));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update task status');
    }
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">
              Welcome back, {user.username}!
            </h1>
            <p className="text-gray-600">Manage your tasks efficiently</p>
          </div>
          <button 
            onClick={logout} 
            className="mt-4 sm:mt-0 px-4 py-2 border border-blue-600 text-blue-600 rounded-md font-medium hover:bg-blue-600 hover:text-white"
          >
            Logout
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-md shadow p-4 border border-gray-200">
            <p className="text-gray-600 text-sm">Total Tasks</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{tasks.length}</p>
          </div>
          <div className="bg-white rounded-md shadow p-4 border border-gray-200">
            <p className="text-gray-600 text-sm">Completed</p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              {tasks.filter(t => t.status === 'completed').length}
            </p>
          </div>
          <div className="bg-white rounded-md shadow p-4 border border-gray-200">
            <p className="text-gray-600 text-sm">Pending</p>
            <p className="text-2xl font-bold text-orange-600 mt-1">
              {tasks.filter(t => t.status === 'pending').length}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-md shadow p-6 mb-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Add New Task</h2>
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          
          <form onSubmit={handleAddTask} className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Task title"
                value={newTask.title}
                onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <textarea
                placeholder="Description (optional)"
                rows="3"
                value={newTask.description}
                onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
            </div>
            
            <button 
              type="submit" 
              className="px-6 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Add Task
            </button>
          </form>
        </div>
        
        <div className="bg-white rounded-md shadow p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Your Tasks</h2>
            {tasks.length > 0 && (
              <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded text-sm">
                {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
              </span>
            )}
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <p>Loading tasks...</p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No tasks yet. Add one above!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {tasks.map(task => (
                <div 
                  key={task._id} 
                  className={`flex items-start justify-between p-3 rounded border ${
                    task.status === 'completed' 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex items-start flex-1">
                    <input
                      type="checkbox"
                      checked={task.status === 'completed'}
                      onChange={() => toggleTaskStatus(task)}
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                    />
                    <div className="ml-3 flex-1">
                      <h3 className={`font-medium ${
                        task.status === 'completed' 
                          ? 'text-gray-500 line-through' 
                          : 'text-gray-900'
                      }`}>
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className={`mt-1 text-sm ${
                          task.status === 'completed' 
                            ? 'text-gray-400' 
                            : 'text-gray-600'
                        }`}>
                          {task.description}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-gray-500">
                        Added on {new Date(task.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDeleteClick(task._id, task.title)}
                    title="Delete task"
                    className="ml-3 p-1 text-red-500 hover:bg-red-50 rounded transition-colors duration-200"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {showDeleteModal && (
        <DeleteConfirmation
          isOpen={showDeleteModal}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          taskTitle={taskToDelete?.title || 'this task'}
        />
      )}
    </div>
  );
};

export default Dashboard;
