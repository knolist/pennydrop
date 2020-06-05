# Knolist
This is our README. Yay

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
If running locally, you must run the server that extracts website data.
1) Open a terminal and run `cd server`
2) Run `python server.py`


## Road Map
5 Sprints of 2 weeks each

### Sprint 1 (Feb 28)
#### Android:
	Skeleton of the app with all the activities
	Login
	Registration
	Entire feed page except for advanced search features
	Thread activity except voting for comments and info
#### Web:
	Login
	Registration
	Create a thread
	View thread
	Reply in thread

#### Business:
	Business Plan Intro
	Business Plan Market Analysis
	Business Plan Marketing Pan

### Sprint 2 (Mar 13)
#### Business:
	Business Plan Solution
	Business Plan Operational plan
	Business Plan costs and financing
	Business Plan team

#### Web:
	Research how analytics will work
	ranking of the four votes
#### Android:
	Advanced search in the feed
	Info in the thread activity
	voting on comments
	Sorting in thread activity

### Sprint 3 (Apr 3)
#### Web:
	Create the analytics
#### Android:
	User experience and interaction
	App redesign
#### Business:
	Get ready for the business plan competition

### Sprint 4 (Apr 17)
	Talk to the business and explore where to improve
	Refine the analytics
#### iOS:
	Skeleton of the app with all the activities
	Login
	Registration
	Entire feed page except for advanced search features
	Thread activity except voting for comments and info

### Sprint 5 (Apr 30, last day of class)
	Talk to the business and explore where to improve
	Refine the analytics
#### iOS:
	Advanced search in the feed
	Info in the thread activity
	voting on comments
	Sorting in thread activity
