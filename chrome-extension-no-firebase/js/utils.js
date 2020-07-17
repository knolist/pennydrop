export default class Utils {
    /**
     * Trims a function for leading or trailing whitespace.
     * Based on https://stackoverflow.com/questions/8517089/js-search-in-object-values
     * @param s
     * @returns {string}
     */
    static trimString = (s) => {
        let l=0, r=s.length -1;
        while(l < s.length && s[l] === ' ') l++;
        while(r > l && s[r] === ' ') r-=1;
        return s.substring(l, r+1);
    };

    /**
     * Finds all occurrences of a given substring in a string.
     * Based on https://stackoverflow.com/questions/3410464/how-to-find-indices-of-all-occurrences-of-one-string-in-another-in-javascript
     * @param searchStr the string query to search
     * @param str the string whose content is explored
     * @returns {[]} an array containing the indices of the substring in the main string
     */
    static getIndicesOf = (searchStr, str) => {
        const searchStrLen = searchStr.length;

        let startIndex = 0, index, indices = [];

        while ((index = str.indexOf(searchStr, startIndex)) > -1) {
            indices.push(index);
            startIndex = index + searchStrLen;
        }

        return indices;
    };

    // Helper global function for title case
    static titleCase = (str) => {
        str = str.toLowerCase().split(' ');
        for (let i = 0; i < str.length; i++) {
            str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
        }
        return str.join(' ');
    };

    // Helper to return the title case and user-friendly title of node property names
    static getNodePropertyTitle = (title) => {
        if (title === "source") return "URL";
        if (title === "nextURLs") return "Next Connections";
        if (title === "prevURLs") return "Previous Connections";
        if (title === "content") return "Page Content";
        return Utils.titleCase(title);
    };

    static isDescendant = (parent, child) => {
        let node = child;
        while (node != null) {
            if (node === parent) {
                return true;
            }
            node = node.parentNode;
        }
        return false;
    };

    static getDefaultNodeColor = () => {
        const color = getComputedStyle(document.documentElement).getPropertyValue("--node-default-color");
        return Utils.trimString(color);
    };

    static getHighlightNodeColor = () => {
        const color = getComputedStyle(document.documentElement).getPropertyValue("--node-highlight-color");
        return Utils.trimString(color);
    };

    static hexToRGB = (color) => {
        const j = {};

        const s = color.replace(/^#([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})$/, function(_, r, g, b) {
            j.red = parseInt(r, 16);
            j.green = parseInt(g, 16);
            j.blue = parseInt(b, 16);
            return "";
        });

        if(s.length === 0) {
            return j;
        }
    };

    static rgbToHex = (color) => {
        return "#" + color.red.toString(16) + "" + color.green.toString(16) + "" + color.blue.toString(16);
    };

    static colorDifference = (a, b) => {
        a = Utils.hexToRGB(a);
        b = Utils.hexToRGB(b);

        if(typeof(a) !== 'undefined' && typeof(b) !== 'undefined') {
            return "#" + (a.red - b.red).toString(16) + (a.green - b.green).toString(16) + (a.blue - b.blue).toString(16);
        }
    };

    static colorBrightness = (color) => {
        color = Utils.hexToRGB(color);
        return (color.red * 299 + color.green * 587 + color.blue * 114) / 1000;
    }
}