const fetch = require("node-fetch");

class VoidBin {
	constructor() {}
	
    /**
     * POST to VoidBin and return the URL
     * 
     * @param { string } title - The title of the content.
	 * @param { string } content - The content of what you wish to post to VoidBin.
	 * @param { string } language - The hightlight language.
	 * @param { string } expiration - The expiration timestamp.
	 * @param { boolean } view_destroy - Should this be deleted on first view?
     * @returns { string } The URL of the created Paste
     * 
     * @example
     * const VoidBin = require("voidbin");
     * const paste = new VoidBin();
     * 
     * paste.post("Lorem ipsum")
     *      .then(url => console.log(url))
     *      .catch(err => console.log(err));
     */
    async post(options) {
		const res = await fetch(`https://voidbin.cc/api/new`, {
		  method: 'POST',
		  body: JSON.stringify({
		    title: options.title || 'No title',
		    content: options.content || 'No content',
		    code_language: options.language || 'text',
		    paste_expiration: options.expiration || '2w',
		    view_destroy: options.view_destroy || false,
		  }),
		  headers: { 'Content-Type': 'application/json' }
		})
		  
        if (res.status === 200) {
            const json = await res.json();
            return `https://voidbin.cc/paste/${json.pasteID}`;
        }

        return res.statusText;
    }

    /**
     * GET from a VoidBin Code and return the content
     * 
     * @param { string } code - The Code of the Paste
     * @returns { string } The content of the URL
     * 
     * @example
     * const VoidBin = require("voidbin");
     * const paste = new VoidBin();
     * 
     * paste.get("https://voidbin.cc/raw/foradowute")
     *      .then(content => console.log(content))
     *      .catch(err => console.log(err));
     */
    async get(code) {
        const res = await fetch('https://voidbin.cc/raw/'+code);
        return res.text();
    }
}
module.exports = VoidBin;