# VoidBin-NPM
An easier way to use [voidbin.cc](https://voidbin.cc)

## Installation
```
npm i voidbin
npm i node-fetch
```

## Example usage
```
const VoidBin = require("voidbin");
const paste = new VoidBin();
 
// POST to VoidBin
paste.post("Lorem ipsum dolor sit amet", "Lorem ipsum dolor sit amet", "text", "2w", false)
    .then(url => console.log(url)) // Return the URL...
    .catch(err => console.log(err)); // Return an error...
 
// GET from VoidBin
paste.get("0gtDs3")
    .then(content => console.log(content)) // Return the content of the paste...
    .catch(err => console.log(err)); // Return an error...```