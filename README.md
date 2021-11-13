# TwinCAT-HMI-Browser
A fullscreen-only browser for TwinCAT HMI applications based on Electron

## Usage
Download the latest release build from the following link: https://github.com/SavonAutomaatio/TwinCAT-HMI-Browser/releases/

Run the setup on the target Panel PC. A settings window will appear, enter at least the TwinCAT HMI Server URL and press save. You can also fill the default username and password fileds if want the user to be able to log in without typing a password. After saving, press the Start Page menu item and close the settings window. If the URL is correct, TwinCAT HMI should show up in a few seconds.

## Accessing settings and closing the browser
You can access settings or close the browser using a keyboard by pressing the ALT key. A menu bar will appear at the top. Settings button opens the settings window and File>Close will exit the browser.

## Building from source
### Install dependencies
We use Yarn 1.x and NodeJS LTS.
```
cd angular
yarn
cd ../electron
yarn
```
### Build the settings frontend
```
cd angular
yarn build
```
### Build and run the browser itself
```
cd electron
yarn start
```
### Build a setup package
```
cd electron
yarn make
```
