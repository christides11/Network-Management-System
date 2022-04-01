# Welcome to the API

## How to use:
1. Use JavaScript native Fetch API or install [Axios](https://axios-http.com/docs/example).
2. Create a method like the examples below to retrieve data.
3. Start the server. CD into the `api` directory and type `python app.py` to do so. 👍 Great! The server should be running on a PORT on your computer.

Notice that we query from the the URL the server is running on! This is where we will make requests

> 🚧 Warning
>
> The server must be running. Make sure to follow the directions above.  

### Axios Example
```
// Make a request for the network
axios.get('http://127.0.0.1:5000/network/')
  .then(function (response) {
    // handle success
    console.log(response);
  })
  .catch(function (error) {
    // handle error
    console.log(error);
  })
  .then(function () {
    // always executed
  });
```

### Fetch API Example
```
// For text...
fetch('http://127.0.0.1:5000/')
  .then(response => response.text())
  .then(text => console.log(text))

// For JSON data...
fetch('http://127.0.0.1:5000/network/')
  .then(response => response.json())
  .then(data => console.log(data))
```

You can also use Postman.


## To run the server:

1. CD into the `api` directory
2. Type `python app.py` in the terminal.


## API Reference
<details>
  <summary>Network</summary>
  
  ## Heading
  1. A numbered
  2. list
     * With some
     * Sub bullets
</details>

<details>
  <summary>Probes</summary>
  
  ## Heading
  1. A numbered
  2. list
     * With some
     * Sub bullets
</details>

<details>
  <summary>Devices</summary>
  
  ## Heading
  1. A numbered
  2. list
     * With some
     * Sub bullets
</details>

<details>
  <summary>Sensors</summary>
  
  ## Heading
  1. A numbered
  2. list
     * With some
     * Sub bullets
</details>