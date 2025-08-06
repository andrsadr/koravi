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
  - text: Connected
  - heading "Dashboard" [level=1]
  - paragraph: Welcome to Koravi CRM - your modern client management system
  - text: Connected
  - heading "Quick Actions" [level=2]
  - paragraph: Get started with your client management
  - button "View All Clients"
  - button "Add New Client"
- region "Notifications (F8)":
  - list
- alert
```