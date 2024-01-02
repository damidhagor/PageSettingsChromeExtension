# PageSettingsChromeExtension

This extensions enables saving and restoring the current zoom and scroll status of a page.
It saves the page's current zoom factor and scroll position into chrome storage and can reload the stored settings and reapply them to the page.

Also it has support for entering a JQuery query string to select page elements which can then be hidden.
The query string is also saved along the zoom and scroll settings.
This is helpful for pages which e.g. display annoying overlays.

To build this extension Typescript needs to be installed via npm and also the Google types:
npm install --save-dev @types/chrome

## Icon

https://icons.getbootstrap.com/icons/columns-gap/
Color: #339AF0