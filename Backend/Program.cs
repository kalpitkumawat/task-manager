using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);
builder.WebHost.UseUrls("http://localhost:5001");

// Add services to the container
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "Task Manager API",
        Version = "v1",
        Description = "A simple task management API"
    });
});
builder.Services.AddSingleton<TaskService>();

// Add CORS policy
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            policy.WithOrigins("http://localhost:3000", "http://localhost:5173")
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

var app = builder.Build();

// Configure the HTTP request pipeline
// Always enable Swagger for this demo app
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Task Manager API V1");
    c.RoutePrefix = "swagger";
});

app.UseCors("AllowFrontend");

var taskService = app.Services.GetRequiredService<TaskService>();

// GET /api/tasks
app.MapGet("/api/tasks", () =>
{
    return Results.Ok(taskService.GetAllTasks());
})
.WithName("GetTasks")
.WithOpenApi();

// POST /api/tasks
app.MapPost("/api/tasks", ([FromBody] CreateTaskRequest request) =>
{
    if (string.IsNullOrWhiteSpace(request.Description))
    {
        return Results.BadRequest(new { error = "Description is required" });
    }

    var task = taskService.CreateTask(request.Description);
    return Results.Created($"/api/tasks/{task.Id}", task);
})
.WithName("CreateTask")
.WithOpenApi();

// PUT /api/tasks/{id}
app.MapPut("/api/tasks/{id}", (Guid id, [FromBody] UpdateTaskRequest request) =>
{
    var task = taskService.UpdateTask(id, request.Description, request.IsCompleted);
    
    if (task == null)
    {
        return Results.NotFound(new { error = "Task not found" });
    }

    return Results.Ok(task);
})
.WithName("UpdateTask")
.WithOpenApi();

// DELETE /api/tasks/{id}
app.MapDelete("/api/tasks/{id}", (Guid id) =>
{
    var success = taskService.DeleteTask(id);
    
    if (!success)
    {
        return Results.NotFound(new { error = "Task not found" });
    }

    return Results.NoContent();
})
.WithName("DeleteTask")
.WithOpenApi();

app.Run();

// Models
public class TaskItem
{
    public Guid Id { get; set; }
    public string Description { get; set; } = string.Empty;
    public bool IsCompleted { get; set; }
    public DateTime CreatedAt { get; set; }
}

public record CreateTaskRequest(string Description);
public record UpdateTaskRequest(string? Description, bool IsCompleted);

// Service
public class TaskService
{
    private List<TaskItem> _tasks = new();
    private readonly object _lock = new();
    private readonly string _storageFile = "tasks.json";

    public TaskService()
    {
        LoadTasks();
    }

    private void LoadTasks()
    {
        if (File.Exists(_storageFile))
        {
            var json = File.ReadAllText(_storageFile);
            _tasks = System.Text.Json.JsonSerializer.Deserialize<List<TaskItem>>(json) ?? new List<TaskItem>();
        }
    }

    private void SaveTasks()
    {
        var json = System.Text.Json.JsonSerializer.Serialize(_tasks);
        File.WriteAllText(_storageFile, json);
    }

    public List<TaskItem> GetAllTasks()
    {
        lock (_lock)
        {
            return _tasks
                .OrderBy(t => t.IsCompleted)  // False comes before True, so active tasks come first
                .ThenByDescending(t => t.CreatedAt)  // Within each group, newest first
                .ToList();
        }
    }

    public TaskItem CreateTask(string description)
    {
        lock (_lock)
        {
            var task = new TaskItem
            {
                Id = Guid.NewGuid(),
                Description = description,
                IsCompleted = false,
                CreatedAt = DateTime.UtcNow
            };
            
            _tasks.Add(task);
            SaveTasks();
            return task;
        }
    }

    public TaskItem? UpdateTask(Guid id, string? description, bool isCompleted)
    {
        lock (_lock)
        {
            var task = _tasks.FirstOrDefault(t => t.Id == id);
            
            if (task == null)
                return null;

            if (description != null)
                task.Description = description;
            
            task.IsCompleted = isCompleted;
            
            SaveTasks();
            return task;
        }
    }

    public bool DeleteTask(Guid id)
    {
        lock (_lock)
        {
            var task = _tasks.FirstOrDefault(t => t.Id == id);
            
            if (task == null)
                return false;

            _tasks.Remove(task);
            SaveTasks();
            return true;
        }
    }
}
