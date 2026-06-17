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

## Technical Details (Wayland & Polkit)

Graphical root applications often fail to launch on Wayland because `pkexec` strips essential environment variables. This application actively bridges that gap by detecting and re-injecting `WAYLAND_DISPLAY`, `DISPLAY`, `XDG_RUNTIME_DIR`, and `XAUTHORITY` variables into the root subshells, ensuring that the Plymouth previewer can spawn a window on your active Wayland session seamlessly.