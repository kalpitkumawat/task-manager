# Task Manager - Full Stack Application

## Features

### Core Requirements 
-  Display a list of tasks
-  Add new tasks with descriptions
-  Mark tasks as completed/uncompleted
-  Delete tasks
-  RESTful API with .NET 8
-  In-memory data storage
-  React with TypeScript frontend
-  Axios for API integration
-  React Hooks for state management

### Enhancements 
-  **Task Filtering**: Filter by All, Active, or Completed tasks
-  **Modern UI**: Beautiful, responsive design with Tailwind CSS
-  **Local Storage**: Tasks persist in browser localStorage as backup
-  **Optimistic Updates**: Instant UI feedback for better UX
-  **Offline Support**: Works offline with automatic sync when back online
-  **Animations**: Smooth transitions and micro-interactions
-  **Statistics Dashboard**: Real-time task completion stats
-  **Timestamps**: Track when tasks were created
-  **Empty States**: Helpful messages when no tasks exist
-  **Error Handling**: Graceful error messages and loading states

## Architecture

### Backend (C# .NET 8)
- **Framework**: ASP.NET Core 8.0 (Minimal API)
- **Storage**: In-memory list with thread-safe operations
- **CORS**: Configured for frontend communication
- **API Documentation**: Swagger/OpenAPI integration

### Frontend (React + TypeScript)
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **State Management**: React Hooks + localStorage
- **Type Safety**: Full TypeScript implementation

## Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js](https://nodejs.org/) (v18 or higher)
- npm or yarn

## Installation & Setup

### 1. Clone or Extract the Project
```bash
cd TaskManagerApp
```

### 2. Backend Setup

```bash
# Navigate to Backend folder
cd Backend

# Restore dependencies
dotnet restore

# Run the API (runs on http://localhost:5000)
dotnet run
```

The backend will start on `http://localhost:5000` with Swagger UI available at `http://localhost:5000/swagger`

### 3. Frontend Setup

Open a **new terminal** window:

```bash
# Navigate to Frontend folder
cd Frontend

# Install dependencies
npm install

# Start development server (runs on http://localhost:3000)
npm run dev
```

The frontend will start on `http://localhost:3000`

## 🔌 API Endpoints

### Base URL: `http://localhost:5000/api`

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/tasks` | Get all tasks | - | `Task[]` |
| POST | `/tasks` | Create a task | `{ description: string }` | `Task` |
| PUT | `/tasks/{id}` | Update a task | `{ description?: string, isCompleted: boolean }` | `Task` |
| DELETE | `/tasks/{id}` | Delete a task | - | `204 No Content` |

### Task Model
```typescript
{
  id: string;           // GUID
  description: string;  // Task description
  isCompleted: boolean; // Completion status
  createdAt: string;    // ISO timestamp
}
```

## Frontend Features

### Task Management
- **Add Tasks**: Type in the input field and press Enter or click "Add Task"
- **Complete Tasks**: Click the circle icon to mark as complete/incomplete
- **Delete Tasks**: Hover over a task and click the trash icon
- **Filter Tasks**: Use the tabs to filter by All, Active, or Completed

### UI Highlights
- **Gradient Background**: Beautiful blue-purple gradient
- **Stats Cards**: Real-time statistics for total, active, and completed tasks
- **Smooth Animations**: Fade-in and slide-in effects for new content
- **Hover Effects**: Interactive elements with hover states
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Empty States**: Helpful messages when no tasks match the filter

### Local Storage
- Tasks are automatically saved to browser localStorage
- Works offline - changes sync when connection is restored
- Data persists across browser sessions

## Testing the Application

### Manual Testing Checklist

1. **Add Tasks**
   - [ ] Create a task with valid description
   - [ ] Try creating an empty task (should be disabled)
   - [ ] Add multiple tasks

2. **Complete Tasks**
   - [ ] Toggle task completion status
   - [ ] Verify visual changes (checkmark, strikethrough)
   - [ ] Check stats update correctly

3. **Filter Tasks**
   - [ ] Switch between All, Active, and Completed filters
   - [ ] Verify correct tasks are shown
   - [ ] Check badge counts update

4. **Delete Tasks**
   - [ ] Delete a task using the trash icon
   - [ ] Verify task is removed
   - [ ] Check stats update correctly

5. **Persistence**
   - [ ] Add tasks and refresh the page
   - [ ] Verify tasks persist in localStorage
   - [ ] Stop backend and verify offline mode works

6. **API Testing**
   - [ ] Visit http://localhost:5000/swagger
   - [ ] Test endpoints using Swagger UI
   - [ ] Verify CORS is working

## Production Build

### Backend
```bash
cd Backend
dotnet publish -c Release -o ./publish
```

### Frontend
```bash
cd Frontend
npm run build
# Output will be in the 'dist' folder
```

## Troubleshooting

### Backend won't start
- Verify .NET 8 SDK is installed: `dotnet --version`
- Check port 5000 is not in use
- Try running on a different port: `dotnet run --urls "http://localhost:5001"`

### Frontend won't start
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear npm cache: `npm cache clean --force`
- Check Node.js version: `node --version` (should be v18+)

### CORS Errors
- Ensure backend is running on port 5000
- Check CORS policy in `Backend/Program.cs`
- Verify frontend URL matches CORS allowed origins

### Tasks not persisting
- Check browser console for errors
- Verify localStorage is enabled in browser
- Check API responses in Network tab
