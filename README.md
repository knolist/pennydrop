# Knolist
Knolist is a research management tool that revolutionizes the way you organize information. 

## Installing and using Babel compiler for React
There are two directories inside `js`: `react-components` and `lib`. You should only write to files in `react-components`, since 
`lib` only holds the compiled code. To compile the code using babel, you must (Linux commands):
1) Install `npm` if you haven't yet
2) Install `babel-cli` using `npm install --save-dev @babel/core`
3) Install the React preset using `npm install babel-cli@6 babel-preset-react-app@3`
4) Compile the code by running the following command from the root directory of the project: 
`npx babel --presets react-app/prod chrome-extension-no-firebase/js/react-components --out-dir chrome-extension-no-firebase/js/lib/` (Recommendation: set up an alias
using by adding the following line to your `~/.bashrc`: `alias babelc_kno='npx babel --presets react-app/prod chrome-extension-no-firebase/js/react-components --out-dir chrome-extension-no-firebase/js/lib/'`, then
run the compiler by calling `babelc_kno` from your command line)  

## Running the server
The server has been deployed to [knolist.herokuapp.com](knolist.herokuapp.com). The source for the deployed version of the server
is in a separate repo in the Knolist organization, called `knolist-backend`. If you make any updates to `server.py`, remember to
transfer that over to the other repo. Automatic deploy is active on Heroku, so all you need to do is push the updated code
to master in `knolist-backend`.

If running locally for debugging purposes, you must run the server that extracts website data.
1) Open a terminal and run `cd server`
2) Run `python3 server.py`
3) If any of the necessary packages is not locally installed, follow the error messages to install them using `pip`

## Automatically Associating GitHub Activity in ClickUp 
ClickUp will automatically pick up new activity and associate it with tasks. 

To enable this, you must: 
Add the ClickUp task ID in any part of the pull request title, branch name, or commit message with CU- in front of it.
Example: CU-ud5b

## Manually Associating GitHub Activity
1. Click the GitHub icon on any task
2. Select the pull request, branch, or commit tab
3. Select a repo then chose a branch
4. Attach your pull request, branch, or commit