# Page snapshot

```yaml
- button
- heading "New Client" [level=1]
- button "Create"
- heading "General" [level=3]
- button "🏷️ No label"
- text: First Name (Required)
- textbox "First Name (Required)": Test
- text: Last Name (Required)
- textbox "Last Name (Required)": User
- text: Gender
- radio "male" [checked]
- text: male
- radio "female"
- text: female
- radio "other"
- text: other Date of birth
- textbox
- heading "Contact Info" [level=3]
- text: Email
- textbox "Email": test@example.com
- text: Phone
- combobox: 🇺🇸 +1
- textbox
- button "More"
- button "Cancel"
- button "Add Client"
- region "Notifications (F8)":
  - list
- alert
```