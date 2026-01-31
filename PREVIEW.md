# Smart Retail Frontend - Visual Preview

## Design Overview

The application features a modern, gradient-based design with a purple/blue color scheme. All pages have smooth animations and a clean, professional look.

## Page Previews

### 1. Login Page
- **Background**: Purple gradient (from #667eea to #764ba2)
- **Card**: White card with blur effect, centered on screen
- **Elements**:
  - Smart Retail logo/header at top
  - Email input field
  - Password input field
  - Login button (gradient purple)
  - Link to register page at bottom
- **Animation**: Card slides up on load

### 2. Register Page
- Similar design to Login page
- Additional fields:
  - Full Name input
  - Confirm Password input
- Same gradient styling and animations

### 3. Dashboard Page
- **Layout**: Sidebar navigation on left, main content on right
- **Sidebar**: 
  - Fixed white sidebar with blur effect
  - Smart Retail logo at top
  - Navigation menu items (Dashboard, Customers, Add Sale, Send SMS)
  - Logout button at bottom
- **Main Content**:
  - Page title "Dashboard" in white
  - Two stat cards side by side:
    - Total Customers card (with 👥 icon)
    - Today's Sales card (with 💰 icon)
  - Welcome message card at bottom
- **Cards**: White background with shadow, hover effects

### 4. Customers Page
- **Header**: 
  - "Customers" title
  - Search box on the right
- **Table**: 
  - White card container
  - Table with purple gradient header
  - Columns: Name, Phone Number, Points
  - Points displayed in purple badge
  - Hover effects on rows
- **Search**: Real-time filtering by name or phone

### 5. Add Sale Page
- **Form Card**: Centered white card
- **Form Elements**:
  - Customer dropdown (shows name, phone, and points)
  - Amount input field
  - "Record Sale" button
- **Feedback**: Success/error messages displayed above form

### 6. Send SMS Page
- **Form Card**: Centered white card (slightly wider)
- **Form Elements**:
  - Group selection dropdown
  - Large textarea for message
  - Character counter
  - "Send SMS" button with 📱 icon
- **Feedback**: Success/error messages

## Color Scheme

- **Primary Gradient**: #667eea → #764ba2 (Purple to Purple)
- **Background**: Gradient overlay
- **Cards**: White with 95% opacity + blur
- **Text**: Dark gray (#333) on white, white on gradient
- **Accents**: Purple for active states, red for errors, green for success

## Interactive Elements

- **Hover Effects**: Cards lift up, buttons scale
- **Active States**: Navigation items highlight with gradient
- **Transitions**: Smooth 0.3s ease transitions
- **Animations**: Fade in and slide up on page load

## Responsive Design

- Sidebar adjusts width on smaller screens
- Grid layouts become single column on mobile
- Forms remain centered and readable

## Typography

- **Font**: Segoe UI, Tahoma, Geneva, Verdana, sans-serif
- **Headings**: Bold, larger sizes
- **Body**: 16px standard, readable line heights

