const BOOKMARK_API_URL = "http://localhost:5000/api/bookmarks";

function API_GetBookmarks() {
    return new Promise(resolve => {
        $.ajax({
            url: BOOKMARK_API_URL,
            success: bookmarks => { resolve(bookmarks); },
            error: (xhr) => { console.log(xhr); resolve(null); }
        });
    });
}

function API_GetBookmark(bookmarkId) {
    return new Promise(resolve => {
        $.ajax({
            url: BOOKMARK_API_URL + "/" + bookmarkId,
            success: bookmark => { resolve(bookmark); },
            error: () => { resolve(null); }
        });
    });
}

function API_SaveBookmark(bookmark, create) {
    return new Promise(resolve => {
        $.ajax({
            url: BOOKMARK_API_URL + (create ? "" : "/" + bookmark.Id),
            type: create ? "POST" : "PUT",
            contentType: 'application/json',
            data: JSON.stringify(bookmark),
            success: () => { resolve(true); },
            error: (xhr) => { console.log(xhr); resolve(false); }
        });
    });
}

function API_DeleteBookmark(id) {
    return new Promise(resolve => {
        $.ajax({
            url: BOOKMARK_API_URL + "/" + id,
            type: "DELETE",
            success: () => { resolve(true); },
            error: (xhr) => { console.log(xhr); resolve(false); }
        });
    });
}