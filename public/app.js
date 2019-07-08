

$.ajax({
  method: "GET",
  url: "scrape"
}).then(function (response) {

  console.log(response);
  $.getJSON("articles", function (data) {

    console.log(data);
    // For each one
    for (var i = 0; i < data.length; i++) {
      // Display the apropos information on the page
      $("#articles").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].link + "</p>");
    }
  });

})







// Grab the articles as a json









// Whenever someone clicks a p tag
$(document).on("click", "p", function () {
  // Empty the notes from the note section
  $("#notes").empty();
  // Save the id from the p tag
  var thisId = $(this).attr("data-id");

  // Now make an ajax call for the Article
  getArticleNotes(thisId);



})




// When you click the savenote button
$(document).on("click", "#savenote", function () {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
      // Value taken from title input
      title: $("#titleinput").val(),
      // Value taken from note textarea
      body: $("#bodyinput").val()
    }
  })
    // With that done
    .then(function (data) {
      // Log the response
      console.log(data);
      // Empty the notes section
      $("#notes").empty();
      getArticleNotes(thisId);
    });

  // Also, remove the values entered in the input and textarea for note entry
  $("#titleinput").val("");
  $("#bodyinput").val("");
});

$(document).on("click", ".removeNote", function(){

  var id = $(this).attr("data-id");
  var articleid = $(this).attr("data-article");
  $.ajax({
    method: "DELETE",
    url: "/deleteNote/" + id
  }).then(function(){

    $("#notes").empty();
    getArticleNotes(articleid);

  })



})

function getArticleNotes(thisId) {


  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  })
    // With that done, add the note information to the page
    .then(function (data) {
      console.log(data);


      // If there's a note in the article
      if (data.note.length > 0) {
        data.note.forEach(function (note, index) {
          // Place the title of the note in the title input
          $("#notes").append("<h2>" + note.title + "</h2>");
          // Place the body of the note in the body textarea
          $("#notes").append("<p>" + note.body + "</p>");
          //remove note
          $("#notes").append("<button class='removeNote' data-article='"+thisId+"'data-id='"+ note._id +"'>Remove</p>");
        });
      }


      // The title of the article
      $("#notes").append("<h2>" + data.title + "</h2>");
      // An input to enter a new title
      $("#notes").append("<input id='titleinput' name='title' >");
      // A textarea to add a new note body
      $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
      // A button to submit a new note, with the id of the article saved to it
      $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");

    });



}