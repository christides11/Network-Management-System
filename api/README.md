# Welcome to the Flask Backend

## How does the Frontend integrate?
1. Install Axios or use Fetch. (this example uses Axios)
2. Create an Axios method like the example below to retrieve data.
3. Start the server. CD into the `backend` directory and type `flask run`.
4. See [Axios Documentation](https://axios-http.com/docs/example) for more information.

Notice that we query from the the url the server is running on!
```
// Make a request for a user with a given ID
axios.get('http://127.0.0.1:5000/user?ID=12345')
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


## To run the server:

1. CD into the `backend` directory
2. Type `flask run` in the terminal.


## API Reference