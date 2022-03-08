# Welcome to the API

## How to use:
1. Use JavaScript native Fetch API or install [Axios](https://axios-http.com/docs/example).
2. Create an method like the examples below to retrieve data.
3. Start the server. CD into the `api` directory and type `flask run`. 👍 Great! The server should be running on a PORT on your computer

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

// For JSON data back
fetch('http://127.0.0.1:5000/network/')
  .then(response => response.json())
  .then(data => console.log(data))
```

You can also use Postman.


## To run the server:

1. CD into the `api` directory
2. Type `flask run` in the terminal.


## API Reference