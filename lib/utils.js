function getUserDetails(success, failure){
  $.ajax({
    type: 'GET',
    url: 'http://inagist.com/getuser.php',
    success: function(data){
      success(data);
    },
    error: function(){
      failure();
    }
  });
}

