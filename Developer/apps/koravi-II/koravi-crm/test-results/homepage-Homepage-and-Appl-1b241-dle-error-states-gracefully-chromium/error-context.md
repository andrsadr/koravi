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
  - heading "Dashboard" [level=1]
  - paragraph: Welcome to Koravi CRM - your modern client management system
  - text: "Connection Failed (Connection failed: Cannot read properties of undefined (reading 'includes'))"
  - heading "Quick Actions" [level=2]
  - paragraph: Get started with your client management
  - button "View All Clients"
  - button "Add New Client"
- region "Notifications (F8)":
  - list
- alert
```