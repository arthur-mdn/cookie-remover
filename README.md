# Cookie Remover - A Chomium web browser extension

This plugin is designed to perform various actions on a webpage, with its primary feature being the ability to “hide” the persistent cookie banners and pop-ups that frequently appear on websites—without actually accepting them! This allows you to enjoy an uninterrupted and tracking-free browsing experience.

![Cookie Remover Home Page](https://raw.githubusercontent.com/arthur-mdn/cookie-remover/main/illustrations/homepage.png)


You can repurpose this tool for other uses, such as hiding or removing specific elements from a webpage, or adding and removing CSS classes from specific elements.

For ease of selection, you can choose elements by their ID, CSS class, or using querySelector. The plugin also includes a visual element selector that lets you pick elements by clicking on them, making it even easier to use.

## Installation

#### Clone the repository
```bash
git clone git@github.com:arthur-mdn/cookie-remover.git
```
#### Install it as a Chrome extension
- Open Chrome, Edge or Arc (Chromium web browsers).
- Go to the Extensions page ([chrome://extensions/](chrome://extensions/) , [edge://extensions/](edge://extensions/) or [arc://extensions/](arc://extensions/)).
5.	Enable Developer Mode.
6.	Click on “Load unpacked extension.”
7.	Select the root folder of the extracted extension.
8.	Enjoy!

## Usage

### Launch actions

#### By clicking on the extension icon
- Click on the extension icon in the browser toolbar.
- Click on the “Clean-up” button.

![Launch actions](https://raw.githubusercontent.com/arthur-mdn/cookie-remover/main/illustrations/launch_actions.png)

#### By using the keyboard shortcut
Press `Ctrl + Shift + Y` (Windows/Linux) or `Cmd + Shift + Y` (Mac).

You can change the keyboard shortcut in your browser settings.
![Launch actions via keyboard shortcut](https://raw.githubusercontent.com/arthur-mdn/cookie-remover/main/illustrations/launch_via_shortcut.png)

#### Auto clean-up
You can enable the auto clean-up feature in the settings tab. The extension will automatically launch actions when you visit a website.
> **Note:** This feature is experimental and may cause slow performance on some websites. It is disabled by default.

### Add an action
You can add an action manually.

#### Possible actions
Here is a list of possible actions :

- Hide an element.
- Add / Remove a CSS class to an element.
- Add / Remove an attribute to an element.
- Add custom CSS to an element.

![Available actions](https://raw.githubusercontent.com/arthur-mdn/cookie-remover/main/illustrations/available_actions.png)

#### Selector
You can select elements by their ID, CSS class, or using querySelector.

You can also use the dynamic selector to select an element by clicking on it.

## Settings and customization
You can customize the extension in the settings tab.
- Display the default actions in the actions list.
- Bruteforce hide mode: Instead of set display:none, the extension will destroy the element.
- Enable / disable dark mode.
- Export / Import parameters.
- Clear the history of actions performed by the extension.
- Check updates of the banlist.

![Settings](https://raw.githubusercontent.com/arthur-mdn/cookie-remover/main/illustrations/settings.png)

## Warnings

Your browser may notify you that this extension has access to website data. This is automatically generated because the plugin intelligently analyzes the HTML source code to hide notification banners. It does not monitor or store your browsing history or personal information.

The history of actions performed by the plugin is stored locally and is never transmitted outside of your device.

**Developer :** Arthur Mondon
