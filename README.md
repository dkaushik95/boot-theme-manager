# Boot Theme Manager for Linux

A simple, feature-complete Electron application to visually manage and preview boot animations (Plymouth) and boot menu splashes (Limine) on Linux systems. 

Built specifically with Wayland and Polkit (`pkexec`) compatibility in mind.

## Features

*   **Plymouth Boot Animations:**
    *   Lists all currently installed Plymouth themes on your system.
    *   **Live Preview:** Shows an 8-second native preview of any graphical theme in a desktop window (Works on X11 and Wayland).
    *   **Apply Theme:** Automatically sets the theme and rebuilds the `initramfs` so the changes take effect on your next boot.
*   **Limine Bootloader Splash:**
    *   Displays your current `/boot/limine-splash.png` image.
    *   Allows you to select any local PNG/JPG image and securely sets it as your new bootloader background.

## Prerequisites

This application interacts with low-level system components. You must have the following installed on your system:
*   `nodejs` and `npm`
*   `plymouth` (for boot animations)
*   `plymouth-x11` (required for desktop previews)
*   `polkit` (provides `pkexec` for secure root prompts)
*   `limine` bootloader (if using the Limine tab)

## Installation & Running

1. Clone this repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/boot-theme-manager.git
   cd boot-theme-manager
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the application:
   ```bash
   npm start
   ```

## Creating a Desktop Shortcut

If you want to add the app to your application grid/launcher, create a file at `~/.local/share/applications/boot-theme-manager.desktop`:

```ini
[Desktop Entry]
Version=1.0
Type=Application
Name=Boot Theme Manager
Comment=Manage Plymouth and Limine Themes
Exec=sh -c "cd /path/to/boot-theme-manager && npm start"
Icon=preferences-desktop-theme
Terminal=false
Categories=Utility;Settings;
```
*(Make sure to update the `/path/to/` inside the `Exec` line)*

## Troubleshooting: Kernel Panic on Boot

If you apply a theme and experience a **Kernel Panic** on your next reboot, it is likely because the `initramfs` image became too large for your bootloader to handle. 

This happens when you use an animation with too many high-resolution frames. Each frame is a raw image that must be loaded into system RAM before the OS even starts.

### How to prevent this:
*   **Limit Frame Count:** Keep animations under 5-8 seconds.
*   **Lower Resolution:** Scale your source images down (e.g., 480p or 360p) before creating the theme.
*   **Lower Framerate:** 12-15 fps is usually enough for a boot animation and significantly reduces the file footprint.

If you are stuck, boot into a recovery environment or use a snapshot to revert your `/boot` directory.