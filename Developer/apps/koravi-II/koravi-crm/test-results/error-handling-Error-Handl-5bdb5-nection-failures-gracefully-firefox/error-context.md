# Page snapshot

```yaml
- link "Skip to main content":
  - /url: "#main-content"
- link "Skip to navigation":
  - /url: "#navigation"
- navigation "Main navigation":
  - navigation:
    - link "Dashboard":
      - /url: /
    - link "Clients":
      - /url: /clients
- banner:
  - button "Toggle sidebar"
  - text: Koravi
  - textbox "Search clients..."
- main "Main content":
  - alert:
    - text: Database connection failed Unable to connect to the database. Please check your connection and try again.
    - button "Retry"
  - text: Database Connection Failed We're having trouble connecting to the database. This might be a temporary issue.
  - button "Try Again"
  - alert: Working Offline Some features may be limited while the database is unavailable.
- region "Notifications (F8)":
  - list
- alert
```