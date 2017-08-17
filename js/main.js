var currentTiles = [];
function updateCurrentTilesHtml() {
    var currentTilesHtml = [];
    for (var i = 0; i < currentTiles.length; i++) {
        currentTilesHtml.push(currentTiles[i].html);
    }
    document.getElementById("activeTileContainer").innerHTML = currentTilesHtml.join('');
}

function clearAll() {
    currentTiles = [];
    document.getElementById("activeTileContainer").innerHTML = '';
    document.getElementById('results').innerHTML = '';
}

$(document).ready(function() {
    $('.modal-toggle').on('click', function(e) {
        e.preventDefault();
        $('.modal').toggleClass('is-visible');
    });

    function combinations(array) {
        return new Array(1 << array.length).fill().map(
            (e1,i) => array.filter((e2, j) => i & 1 << j));
    }

    function *permute(a, n = a.length) {
        if (n <= 1) yield a.slice();
        else for (let i = 0; i < n; i++) {
            yield *permute(a, n - 1);
            const j = n % 2 ? 0 : i;
            [a[n-1], a[j]] = [a[j], a[n-1]];
        }
    }

    function merge(a1, a2) {
        var hash = {};
        var arr = [];
        var i = 0;
        var l = a1.length;
        for (; i < l; i++) {
            if (hash[a1[i]] !== true) {
                hash[a1[i]] = true;
                arr[arr.length] = a1[i];
            }
        }
        l = a2.length;
        for (i = 0; i < l; i++) {
            if (hash[a2[i]] !== true) {
                hash[a2[i]] = true;
                arr[arr.length] = a2[i];
            }
        }
        return arr;
    }

    function updateResults() {
        var maybe_values = [];
        var sure_values = [];
        var i = 0;
        var l = currentTiles.length;
        for (; i < l; i++) {
            if (currentTiles[i].text_mode) {
                maybe_values.push(String.fromCharCode(currentTiles[i].val));
            } else {
                sure_values.push(String.fromCharCode(currentTiles[i].val));
            }
        }
        sure_values = sure_values.join('');
        var combs = combinations(maybe_values);
        var joined = [];
        l = combs.length;
        for (i = 0; i < l; i++) {
            joined.push(combs[i].join('') + sure_values);
        }
        var perms = [];
        l = joined.length;
        for (i = 0; i < l; i++) {
            perms = merge(perms, Array.from(permute(joined[i].split(''))).map(perm => perm.join('')));
        }
        var final = [];
        l = perms.length;
        for (i = 0; i < l; i++) {
            if (en_dict[perms[i].toLowerCase()]) {
                final.push(perms[i]);
            }
        }

        if (final.length != 0) {
            document.getElementById("results").innerHTML = '<center><ul class="list"><li>' + final.join('</li><li>') + '</li></ul></center>';
        } else {
            document.getElementById("results").innerHTML = '<center>No possible words.</center>';
        }
    }

    $.getScript('js/en_dict.js', function() {
        document.getElementById("loading").innerHTML = '';
        var textMode = true;
        $(document).keydown(function(e) {
            if (e.which >= 65 && e.which <= 90 && currentTiles.length < 12) {
                currentTiles.push(
                    {
                        val: e.which,
                        text_mode: textMode,
                        html: '<a onclick=" currentTiles.splice(currentTiles.findIndex(o => o.val == ' + e.which + ' && o.text_mode == ' + textMode +'), 1); updateCurrentTilesHtml();"> <div class="' + (textMode ? 'numberCircle' : 'numberCircleLock') + '">' + String.fromCharCode(e.which) + '</div></a>'
                    });
                updateCurrentTilesHtml();
                e.preventDefault();
            } else if (e.which == 32) {
                textMode = !textMode;
                e.preventDefault();
            } else if (e.which == 13) {
                updateResults();
                e.preventDefault();
            } else if (e.which == 8) {
                clearAll();
                e.preventDefault();
            }
        });
    });
});
