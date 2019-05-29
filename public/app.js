$(document).on("click", "#scrapeButton", function () {
    $.getJSON("/articles", function (data) {

        for (var i = 0; i < data.length; i++) {
            $("#articles").append("<h3 data-id='" + data[i]._id + "'>" + data[i].title + "</h3>"
                + "URL: " + "<a href='" + data[i].link + "'> Click Here </a>"
                + "<p>" + data[i].teaser + "</p>"
                + "<img src='" + data[i].photo + "' />"
                + "<hr>"
            );
        }
    });
});

$(document).on("click", "p", function () {
    $("#notes").empty();
    var thisId = $(this).attr("data-id");
    $.ajax({
        method: "GET",
        url: "/articles/" + thisId
    })
        .then(function (data) {
            console.log(data);
            $("#notes").append("<h2>Save a Note about This Article</h2>");
            $("#notes").append("<input type='text' id='titleinput' name='title' >");
            $("#notes").append("<textarea class='form-control' id='bodyinput' name='body'></textarea>");
            $("#notes").append("<button type='button' class='btn btn-primary btn-lg' data-id='" + data._id + "' id='savenote'>Save Note</button>");

            if (data.note) {
                $("#titleinput").val(data.note.title);
                $("#bodyinput").val(data.note.body);
            }
        });
});

$(document).on("click", "#savenote", function () {
    var thisId = $(this).attr("data-id");

    $.ajax({
        method: "POST",
        url: "/articles/" + thisId,
        data: {
            title: $("#titleinput").val(),
            body: $("#bodyinput").val()
        }
    })
        .then(function (data) {
            console.log(data);
            $("#notes").empty();
        });
    $("#titleinput").val("");
    $("#bodyinput").val("");
});