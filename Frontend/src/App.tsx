import { useState, useEffect } from "react";
import { CheckCircle2, Circle, Trash2, Plus, ListTodo } from "lucide-react";
import { taskApi } from "./api";
import { Task, FilterType } from "./types";
import { useLocalStorage } from "./useLocalStorage";
import "./index.css";

function App() {
  const [tasks, setTasks] = useLocalStorage<Task[]>("tasks", []);
  const [isDarkMode, setIsDarkMode] = useLocalStorage("darkMode", false);
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);

  // Fetch tasks on mount
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedTasks = await taskApi.getAllTasks();
      // Sort tasks with active ones first, then by creation date
      const sortedTasks = fetchedTasks.sort((a, b) => {
        if (a.isCompleted !== b.isCompleted) {
          return a.isCompleted ? 1 : -1; // Active tasks first
        }
        // Within same completion status, sort by date descending (newest first)
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
      setTasks(sortedTasks);
      setIsOnline(true);
    } catch (err) {
      console.error("Failed to fetch tasks, using local storage:", err);
      setIsOnline(false);
      setError(
        "Using offline mode - tasks will sync when connection is restored"
      );
    } finally {
      setLoading(false);
    }
  };

  const addTask = async () => {
    if (!newTaskDescription.trim()) return;

    const tempTask: Task = {
      id: crypto.randomUUID(),
      description: newTaskDescription,
      isCompleted: false,
      createdAt: new Date().toISOString(),
    };

    // Optimistically update UI with sorting
    setTasks((prev) => {
      const updatedTasks = [...prev, tempTask];
      return updatedTasks.sort((a, b) => {
        if (a.isCompleted !== b.isCompleted) {
          return a.isCompleted ? 1 : -1;
        }
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
    });
    setNewTaskDescription("");

    try {
      const createdTask = await taskApi.createTask({
        description: newTaskDescription,
      });
      // Replace temp task with real one from server and maintain sorting
      setTasks((prev) => {
        const updatedTasks = prev.map((t) =>
          t.id === tempTask.id ? createdTask : t
        );
        return updatedTasks.sort((a, b) => {
          if (a.isCompleted !== b.isCompleted) {
            return a.isCompleted ? 1 : -1;
          }
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        });
      });
      setIsOnline(true);
    } catch (err) {
      console.error("Failed to create task:", err);
      setIsOnline(false);
      // Keep the optimistic update in localStorage
    }
  };

  const toggleTaskCompletion = async (task: Task) => {
    const updatedTask = { ...task, isCompleted: !task.isCompleted };

    // Optimistically update UI with sorting
    setTasks((prev) => {
      const updatedTasks = prev.map((t) =>
        t.id === task.id ? updatedTask : t
      );
      return updatedTasks.sort((a, b) => {
        if (a.isCompleted !== b.isCompleted) {
          return a.isCompleted ? 1 : -1;
        }
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
    });

    try {
      await taskApi.updateTask(task.id, { isCompleted: !task.isCompleted });
      setIsOnline(true);
    } catch (err) {
      console.error("Failed to update task:", err);
      setIsOnline(false);
      // Revert on error if needed, or keep optimistic update
    }
  };

  const deleteTask = async (taskId: string) => {
    // Optimistically remove from UI
    setTasks((prev) => prev.filter((t) => t.id !== taskId));

    try {
      await taskApi.deleteTask(taskId);
      setIsOnline(true);
    } catch (err) {
      console.error("Failed to delete task:", err);
      setIsOnline(false);
      // Task already removed from local state
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === "active") return !task.isCompleted;
    if (filter === "completed") return task.isCompleted;
    return true;
  });

  const stats = {
    total: tasks.length,
    active: tasks.filter((t) => !t.isCompleted).length,
    completed: tasks.filter((t) => t.isCompleted).length,
  };

  return (
    <div
      className={`min-h-screen transition-all duration-300 ${
        isDarkMode
          ? "bg-gradient-to-br from-[#07112b] via-[#0f1b36] to-[#07112b]"
          : "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"
      }`}
    >
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Dark Mode Toggle */}
        <div className="fixed bottom-8 right-8">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            aria-label={
              isDarkMode ? "Switch to light mode" : "Switch to dark mode"
            }
            className={`p-4 rounded-full transition-all duration-300 shadow-2xl hover:shadow-2xl transform hover:scale-105 flex items-center gap-3 ${
              isDarkMode
                ? "bg-[#122033] text-[#FFD66B] hover:bg-[#243042] hover:text-[#FFE08A] border border-[#223245] ring-1 ring-[#223245]/30"
                : "bg-white text-indigo-600 hover:bg-indigo-50 border border-gray-200"
            }`}
          >
            {isDarkMode ? (
              <>
                <svg
                  className="w-7 h-7"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
                <span className="text-sm font-medium">Light Mode</span>
              </>
            ) : (
              <>
                <svg
                  className="w-7 h-7"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
                <span className="text-sm font-medium">Dark Mode</span>
              </>
            )}
          </button>
        </div>
        {/* Header */}
        <div className="text-center mb-8 animate-fadeIn">
          <div className="flex items-center justify-center mb-4">
            <ListTodo className="w-12 h-12 text-indigo-600 mr-3" />
            <h1
              className={`text-5xl font-bold ${
                isDarkMode ? "text-white" : "text-gray-800"
              }`}
            >
              Task Manager
            </h1>
          </div>
          <p
            className={`text-lg ${
              isDarkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Stay organized and productive
          </p>

          {/* Status Badge */}
          {!isOnline && (
            <div className="mt-4 inline-flex items-center px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-sm">
              <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2 animate-pulse"></span>
              Offline Mode
            </div>
          )}
        </div>

        {/* Stats Cards */}
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8 animate-slideIn">
          <div
            className={`rounded-xl shadow-sm p-4 transition-colors duration-200 ${
              isDarkMode
                ? "bg-gray-800 border border-gray-700"
                : "bg-white border border-gray-100"
            }`}
          >
            <div className="text-3xl font-bold text-indigo-500">
              {stats.total}
            </div>
            <div
              className={`text-sm ${
                isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Total Tasks
            </div>
          </div>
          <div
            className={`rounded-xl shadow-sm p-4 transition-colors duration-200 ${
              isDarkMode
                ? "bg-gray-800 border border-gray-700"
                : "bg-white border border-gray-100"
            }`}
          >
            <div className="text-3xl font-bold text-blue-500">
              {stats.active}
            </div>
            <div
              className={`text-sm ${
                isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Active
            </div>
          </div>
          <div
            className={`rounded-xl shadow-sm p-4 transition-colors duration-200 ${
              isDarkMode
                ? "bg-gray-800 border border-gray-700"
                : "bg-white border border-gray-100"
            }`}
          >
            <div className="text-3xl font-bold text-green-500">
              {stats.completed}
            </div>
            <div
              className={`text-sm ${
                isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Completed
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div
          className={`rounded-2xl overflow-hidden animate-slideIn transition-all duration-300 ${
            isDarkMode
              ? "bg-[#0f1b2a]/90 backdrop-blur-sm shadow-2xl shadow-[#07112b]/50 border border-[#123044]/20"
              : "bg-white shadow-xl"
          }`}
        >
          {/* Add Task Section */}
          <div
            className={`p-6 transition-colors duration-200 ${
              isDarkMode
                ? "border-b border-[#123044] bg-gradient-to-r from-[#0f1b2a] to-[#142634]"
                : "border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50"
            }`}
          >
            <div className="flex gap-3">
              <input
                type="text"
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addTask()}
                placeholder="What needs to be done?"
                className={`flex-1 px-4 py-3 rounded-xl border-2 focus:outline-none transition-colors ${
                  isDarkMode
                    ? "bg-[#0e2434] border-[#123044] text-[#E6EDF3] placeholder-[#7b8a9a] focus:border-[#7C5CFF] focus:ring-2 focus:ring-[#7C5CFF]/20"
                    : "bg-white border-gray-200 text-gray-800 placeholder-gray-400 focus:border-indigo-500"
                }`}
              />
              <button
                onClick={addTask}
                disabled={!newTaskDescription.trim()}
                className={`px-6 py-3 rounded-xl transition-all duration-200 flex items-center gap-2 font-medium shadow-md hover:shadow-lg ${
                  isDarkMode
                    ? "bg-[#7C5CFF] hover:bg-[#6849ff] text-white disabled:bg-[#273543] disabled:text-[#9AA4AF]"
                    : "bg-indigo-600 hover:bg-indigo-700 text-white disabled:bg-gray-300"
                } disabled:cursor-not-allowed`}
              >
                <Plus className="w-5 h-5" />
                Add Task
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div
            className={`flex border-b ${
              isDarkMode
                ? "border-gray-800 bg-gray-900"
                : "border-gray-100 bg-gray-50"
            }`}
          >
            {(["all", "active", "completed"] as FilterType[]).map(
              (filterType) => (
                <button
                  key={filterType}
                  onClick={() => setFilter(filterType)}
                  className={`flex-1 py-4 text-sm font-medium transition-all duration-200 ${
                    filter === filterType
                      ? isDarkMode
                        ? "text-indigo-400 border-b-2 border-indigo-400 bg-gray-900"
                        : "text-indigo-600 border-b-2 border-indigo-600 bg-white"
                      : isDarkMode
                      ? "text-gray-400 hover:text-gray-200 hover:bg-gray-800"
                      : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                  }`}
                >
                  {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                  <span className="ml-2 px-2 py-1 rounded-full text-xs bg-gray-200">
                    {filterType === "all"
                      ? stats.total
                      : filterType === "active"
                      ? stats.active
                      : stats.completed}
                  </span>
                </button>
              )
            )}
          </div>

          {/* Task List */}
          <div
            className={`divide-y ${
              isDarkMode ? "divide-[#123044]/40" : "divide-gray-100"
            }`}
          >
            {loading && tasks.length === 0 ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading tasks...</p>
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ListTodo className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  No tasks found
                </h3>
                <p className="text-gray-600">
                  {filter === "all"
                    ? "Add your first task to get started!"
                    : `No ${filter} tasks at the moment.`}
                </p>
              </div>
            ) : (
              filteredTasks.map((task, index) => (
                <div
                  key={task.id}
                  className={`p-4 transition-colors duration-150 animate-fadeIn group ${
                    isDarkMode ? "hover:bg-[#0f1b2a]" : "hover:bg-gray-50"
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center gap-4">
                    {/* Checkbox */}
                    <button
                      onClick={() => toggleTaskCompletion(task)}
                      className="flex-shrink-0 transition-transform hover:scale-110"
                    >
                      {task.isCompleted ? (
                        <CheckCircle2 className="w-6 h-6 text-green-500" />
                      ) : (
                        <Circle className="w-6 h-6 text-gray-400 hover:text-indigo-500" />
                      )}
                    </button>

                    {/* Task Description */}
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-lg transition-all duration-200 ${
                          isDarkMode
                            ? task.isCompleted
                              ? "text-[#8B97A6] line-through"
                              : "text-[#E6EDF3]"
                            : task.isCompleted
                            ? "text-gray-400 line-through"
                            : "text-gray-800"
                        }`}
                      >
                        {task.description}
                      </p>
                      <p
                        className={`text-xs mt-1 ${
                          isDarkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        {new Date(task.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="flex-shrink-0 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {tasks.length > 0 && (
            <div
              className={`p-4 text-center text-sm border-t transition-colors duration-200 ${
                isDarkMode
                  ? "bg-gray-800 text-gray-400 border-gray-700"
                  : "bg-gray-50 text-gray-600 border-gray-100"
              }`}
            >
              {stats.active} {stats.active === 1 ? "task" : "tasks"} remaining
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div
            className={`mt-4 p-4 rounded-lg text-sm text-center transition-colors duration-200 ${
              isDarkMode
                ? "bg-yellow-900/30 border border-yellow-700/50 text-yellow-200"
                : "bg-yellow-50 border border-yellow-200 text-yellow-800"
            }`}
          >
            {error}
          </div>
        )}

        {/* Footer Note */}
        <div className="mt-8 text-center text-sm">
          <p
            className={`transition-colors duration-200 ${
              isDarkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Tasks are automatically saved to your browser's local storage
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
