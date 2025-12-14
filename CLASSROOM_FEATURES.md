# Classroom Community Features

## Overview

This document describes the new classroom community features added to the attendance tracking app. These features enable collaborative learning environments with material sharing, role-based access control, and an interactive bot interface.

## Features Implemented

### 1. Classroom Management

#### Creating Classrooms
- Users can create classrooms with title and optional description
- Automatic role assignment (Owner for creator)
- Unique classroom IDs for identification

#### Joining Classrooms
- **QR Code Scanning**: Scan classroom QR codes to join instantly
- **Invite Links**: Use deep links or invite codes to join
- **Approval System**: Optional approval mode for classroom owners

#### Role-Based Access Control
- **Owner**: Full control over classroom settings and members
- **Teacher**: Can upload materials, send announcements, manage students
- **CR (Class Representative)**: Can upload materials and send announcements
- **Admin**: Can manage materials and moderate content
- **Student**: Can view and download materials, respond to bot

### 2. Materials Library

#### Supported File Types
- **Documents**: PDF, DOC, DOCX
- **Presentations**: PPT, PPTX
- **Images**: JPG, JPEG, PNG
- **Links**: External URLs and GitHub repositories
- **Direct Uploads**: Files stored in app backend

#### Material Features
- **Metadata Storage**: Title, subject, uploader, date, version, file size
- **Pinning System**: Important materials can be pinned for easy access
- **Search & Filter**: Find materials by title, subject, or type
- **Version Control**: Track different versions of materials
- **Download/View**: Direct access to materials with proper permissions

#### Upload Options
- **Direct Upload**: Store files in app's backend storage
- **External Links**: Reference files hosted elsewhere
- **GitHub Integration**: Link to GitHub repositories or files

### 3. Class Bot (Telegram-style Chat Interface)

#### Bot Features
- **Welcome Message**: Personalized greeting for each classroom
- **Quick Reply Buttons**: Easy navigation through materials
- **Material Discovery**: Browse materials by subject
- **Announcements**: View and create classroom announcements
- **Interactive Chat**: Type questions and get responses

#### Bot Commands
- **Browse Materials**: Show available subjects and materials
- **Search Materials**: Find specific materials
- **Announcements**: View recent announcements
- **Help**: Show available commands and features

#### Message Types
- **Text Messages**: Regular bot responses
- **Material Cards**: Interactive material previews with download/view options
- **Announcement Cards**: Highlighted announcement messages
- **Quick Reply Buttons**: Action buttons for easy navigation

### 4. QR Code & Invite System

#### QR Code Generation
- **Dynamic QR Codes**: Generated per classroom with unique tokens
- **Invite Data**: Contains classroom ID, name, and secure token
- **Sharing Options**: Copy invite link or share QR code image

#### Invite Management
- **Secure Tokens**: Time-limited invite tokens for security
- **Deep Links**: Direct app navigation via invite links
- **Clipboard Integration**: Easy copying of invite links

### 5. User Interface Enhancements

#### Navigation
- **New Tab**: "Classroom" tab in bottom navigation
- **Stack Navigation**: Nested navigation for classroom features
- **Consistent Design**: Matches existing app design language

#### Dark Mode Support
- **Full Compatibility**: All new components support dark mode
- **Consistent Theming**: Uses existing color scheme
- **Accessibility**: Proper contrast ratios maintained

## Technical Implementation

### File Structure
```
├── Classroom.js              # Main classroom dashboard
├── JoinClassroom.js          # QR scanning and invite joining
├── ClassroomDetail.js        # Classroom details and materials
├── ClassBot.js              # Telegram-style chat interface
├── QRCodeGenerator.js       # QR code generation component
└── utils/
    └── api.js               # Backend API integration
```

### Dependencies Added
- `react-native-qrcode-svg`: QR code generation
- `react-native-svg`: SVG support for QR codes
- Additional Expo modules for enhanced functionality

### API Integration
- **RESTful Endpoints**: Complete API structure for all features
- **JWT Authentication**: Secure token-based authentication
- **Error Handling**: Comprehensive error management
- **File Upload**: Multipart form data support

## Backend Requirements

### Flask API Endpoints

#### Classroom Management
```python
GET    /classrooms                    # List user's classrooms
POST   /classrooms                    # Create new classroom
GET    /classrooms/{id}               # Get classroom details
PUT    /classrooms/{id}               # Update classroom
DELETE /classrooms/{id}               # Delete classroom
POST   /classrooms/join               # Join with invite code
POST   /classrooms/{id}/invite        # Generate invite
```

#### Materials Management
```python
GET    /classrooms/{id}/materials     # List materials
POST   /classrooms/{id}/materials     # Upload material
PUT    /classrooms/{id}/materials/{material_id}  # Update material
DELETE /classrooms/{id}/materials/{material_id}  # Delete material
PUT    /classrooms/{id}/materials/{material_id}/pin  # Toggle pin
GET    /classrooms/{id}/materials/{material_id}/download  # Download
```

#### Member Management
```python
GET    /classrooms/{id}/members       # List members
PUT    /classrooms/{id}/members/{member_id}  # Update role
DELETE /classrooms/{id}/members/{member_id}  # Remove member
```

#### Announcements
```python
GET    /classrooms/{id}/announcements # List announcements
POST   /classrooms/{id}/announcements # Create announcement
PUT    /classrooms/{id}/announcements/{announcement_id}  # Update
DELETE /classrooms/{id}/announcements/{announcement_id}  # Delete
```

### Database Schema

#### Classrooms Table
```sql
CREATE TABLE classrooms (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    owner_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_public BOOLEAN DEFAULT FALSE,
    requires_approval BOOLEAN DEFAULT FALSE
);
```

#### Classroom Members Table
```sql
CREATE TABLE classroom_members (
    id VARCHAR(36) PRIMARY KEY,
    classroom_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    role ENUM('owner', 'teacher', 'cr', 'admin', 'student') DEFAULT 'student',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'approved',
    FOREIGN KEY (classroom_id) REFERENCES classrooms(id) ON DELETE CASCADE
);
```

#### Materials Table
```sql
CREATE TABLE materials (
    id VARCHAR(36) PRIMARY KEY,
    classroom_id VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    subject VARCHAR(100),
    file_type VARCHAR(10),
    file_size BIGINT,
    file_url VARCHAR(500),
    uploader_id VARCHAR(36) NOT NULL,
    version VARCHAR(20),
    is_pinned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (classroom_id) REFERENCES classrooms(id) ON DELETE CASCADE
);
```

#### Announcements Table
```sql
CREATE TABLE announcements (
    id VARCHAR(36) PRIMARY KEY,
    classroom_id VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    author_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (classroom_id) REFERENCES classrooms(id) ON DELETE CASCADE
);
```

## Usage Guide

### For Teachers/Owners

1. **Create a Classroom**
   - Tap the "+" FAB in the Classroom tab
   - Enter classroom title and description
   - Set privacy and approval settings

2. **Invite Students**
   - Open classroom details
   - Tap "Invite" button
   - Share QR code or invite link

3. **Upload Materials**
   - Navigate to Materials tab
   - Tap "+" FAB to upload
   - Fill in material details
   - Choose file or external link

4. **Send Announcements**
   - Use Class Bot tab
   - Tap "New Announcement"
   - Write and send announcement

### For Students

1. **Join a Classroom**
   - Scan QR code or use invite link
   - Wait for approval if required
   - Access classroom content

2. **Access Materials**
   - Browse by subject in Materials tab
   - Use Class Bot for quick access
   - Download or view materials

3. **Stay Updated**
   - Check announcements in Class Bot
   - Receive notifications for new content
   - Use search to find specific materials

## Future Enhancements

### Planned Features
- **Push Notifications**: Real-time updates for new materials and announcements
- **Offline Caching**: Access materials without internet connection
- **Multi-language Support**: Internationalization for bot messages
- **Advanced Search**: Full-text search across all materials
- **Material Analytics**: Track downloads and engagement
- **Collaborative Features**: Comments and ratings on materials

### Technical Improvements
- **Real-time Updates**: WebSocket integration for live updates
- **File Compression**: Optimize storage and download speeds
- **Advanced Permissions**: Granular access control
- **Backup System**: Automatic data backup and recovery
- **Performance Optimization**: Lazy loading and caching strategies

## Security Considerations

### Authentication & Authorization
- JWT tokens for secure authentication
- Role-based access control (RBAC)
- Token refresh mechanism
- Secure file upload validation

### Data Protection
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- File type validation

### Privacy
- User consent for data collection
- GDPR compliance considerations
- Data retention policies
- Secure data transmission (HTTPS)

## Troubleshooting

### Common Issues

1. **QR Code Not Scanning**
   - Ensure camera permissions are granted
   - Check QR code quality and lighting
   - Verify invite hasn't expired

2. **Can't Upload Materials**
   - Check file size limits
   - Verify supported file types
   - Ensure proper permissions

3. **Bot Not Responding**
   - Check internet connection
   - Restart the app
   - Clear app cache if needed

### Support

For technical support or feature requests, please refer to the project documentation or contact the development team.

---

*This document is part of the Classroom Community Features implementation for the Attendance Tracking App.*