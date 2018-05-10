var pagination;

$(document).ready(function() {
    
    // Register click handler for search button to get current releases:
    $("#btn-search").click(function() {

        $("form").validate({

            rules: {
                artistname: {
                    required: true,
                    minlength: 1
                }
            },
            messages: {
                artistname: "Please type an artist name."
            },
            submitHandler: function() {
                var artistName = $("#input-artist-name").val();  
                var getNewReleasesEndpoint = `https://api.discogs.com/database/search?type=release&year=${new Date().getFullYear()}&artist=${artistName}&per_page=3&page=1`;
                showReleases(getNewReleasesEndpoint);
            }
        });        
    });

    // Register click handler for Next button:
    $("#next").click(function() {
        showReleases(pagination.urls.next);
    });
    
    // Register click handler for Previous button:
    $("#previous").click(function() {
        showReleases(pagination.urls.prev);
    });    
});

// Call API to get list of new releases:
function showReleases(endpoint) {

    $("#error-panel").hide();
    $("#no-results").hide();

    console.log("API call: Search endpoint");
    $.ajax({
        method: "GET",
        url: endpoint,
        headers:
        {
            "Authorization": "Discogs token=RbvwWnsEnRskVDRIDcrTukupSbgovHnfxIbFPEgZ"
        },
        success: function(data) {

            // Set up pagination control:
            console.log("Set up pagination control");
            pagination = data.pagination;
            if (pagination.items == 0) {
                $("#no-results").show();
                $("#release-pager").hide();                
            } else {
                $("#release-pager").show();
            }

            $("#page-indicator").text(`Page ${pagination.page} of ${pagination.pages}`);
            if (pagination.page > 1) {
                $("#previous").removeClass("disabled");
            } else {
                $("#previous").addClass("disabled");
            }
            if (pagination.pages > pagination.page) {
                $("#next").removeClass("disabled");
            } else {
                $("#next").addClass("disabled");
            }


            
            console.log(pagination);

            // Remove previous results:
            $(".artistDetails article").remove();            
            
            // Loop through all releases:
            var releases = data.results;
            for (var i = 0; i < releases.length; i++) { 
                               
                var release = releases[i];                

                // Call API to get details of this release:
                var getReleaseDetailsEndpoint = `https://api.discogs.com/releases/${release.id}?USD`;
                console.log("API call: Release detail endpoint");
                $.ajax({
                    method: "GET",
                    url: getReleaseDetailsEndpoint,
                    headers:
                    {
                        "Authorization": "Discogs token=RbvwWnsEnRskVDRIDcrTukupSbgovHnfxIbFPEgZ"
                    },
                    success: function(releaseDetail) {

                        // Render release details to the page:
                        var imgUrl;

                        if (releaseDetail.images && releaseDetail.images.length > 0) {
                            imgUrl = releaseDetail.images[0].resource_url;
                        } else {
                            imgUrl = "img/release-placeholder.png";                          
                        }                       

                        $(".artistDetails").append(`<article><span class="helper"></span><a href="${releaseDetail.uri}" target="_blank"><img src="${imgUrl}" /></a><div class="textArea"><p class="artistName">${releaseDetail.artists[0].name}</p><p class="releaseTitle">${releaseDetail.title}</p></div></article>`); 
                        console.log(releaseDetail);
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        $("#error-panel").show();
                    }
                });
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            $("#error-panel").show();
        }
    });
}