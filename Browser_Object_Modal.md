Comprehensive Guide to the Browser Object Model (BOM)
=====================================================

The BOM's primary object is window. Every other object—document, screen, location, history, and navigator—is a property of the window object.

1\. The Window Object
---------------------

The window object represents the browser window. In a browser environment, it is the Global Object.

### Key Properties

*   **window.innerHeight / window.innerWidth**: The height and width of the browser window's content area (including scrollbars).
    
*   **window.outerHeight / window.outerWidth**: The total height and width of the browser window, including toolbars and borders.
    
*   **window.localStorage / window.sessionStorage**: Provides mechanisms for storing data locally in the browser.
    
*   **window.screen**: References the Screen object.
    

### Key Methods

*   **window.open() / window.close()**: Opens a new window or closes the current one.
    
*   **window.moveTo() / window.resizeTo()**: Moves or resizes the current window.
    
*   **window.alert() / window.confirm() / window.prompt()**: Standard dialog boxes.
    
*   **window.setTimeout() / window.setInterval()**: Timing events.
    

2\. The Screen Object
---------------------

Contains information about the visitor's screen display.

**PropertyDescription**screen.widthTotal width of the screen.screen.heightTotal height of the screen.screen.availWidthWidth of the screen, minus interface features like the Windows Taskbar.screen.availHeightHeight of the screen, minus interface features.screen.colorDepthThe bit depth of the color palette for displaying images.

3\. The Location Object
-----------------------

Used to get the current page address (URL) and to redirect the browser to a new page.

### Properties

*   **location.href**: Returns the full URL of the current page.
    
*   **location.hostname**: Returns the domain name of the web host.
    
*   **location.pathname**: Returns the path and filename of the current page.
    
*   **location.protocol**: Returns the web protocol used (http: or https:).
    
*   **location.port**: Returns the port number (e.g., 80 or 443).
    
*   **location.search**: Returns the query string part of a URL (starts with ?).
    

### Methods

*   **location.assign()**: Loads a new document.
    
*   **location.replace()**: Replaces the current document with a new one (removes current page from session history).
    
*   **location.reload()**: Reloads the current document.
    

4\. The History Object
----------------------

Contains the browser's history (the URLs the user has visited in the current tab).

*   **history.back()**: Same as clicking the back button in the browser.
    
*   **history.forward()**: Same as clicking the forward button.
    
*   **history.go(n)**: Moves to a specific point in history. history.go(-2) moves back two pages.
    
*   **history.length**: Returns the number of URLs in the history list.
    

5\. The Navigator Object
------------------------

Contains information about the visitor's browser. Note that much of this information can be spoofed or is deprecated for privacy reasons.

### Properties

*   **navigator.appName**: Returns the name of the browser.
    
*   **navigator.appVersion**: Returns version information.
    
*   **navigator.userAgent**: Returns the user-agent header sent by the browser.
    
*   **navigator.platform**: Returns the operating system platform.
    
*   **navigator.language**: Returns the browser's language.
    
*   **navigator.onLine**: Returns a boolean indicating if the browser is online.
    
*   **navigator.geolocation**: An object used to locate the user's position.
    

### Methods

*   **navigator.javaEnabled()**: Returns true if Java is enabled.
    
*   **navigator.sendBeacon()**: Used to asynchronously transfer small amounts of data to a server.
    

6\. Popup Alerts
----------------

The BOM allows for three types of popups:

1.  **Alert**: window.alert("message") - Displays data and an OK button.
    
2.  **Confirm**: window.confirm("message") - Returns true if OK is clicked, false otherwise.
    
3.  **Prompt**: window.prompt("label", "default") - Returns the text entered by the user.