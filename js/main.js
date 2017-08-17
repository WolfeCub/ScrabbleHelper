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
        for (var i = 0; i < a1.length; i++) {
            if (hash[a1[i]] !== true) {
                hash[a1[i]] = true;
                arr[arr.length] = a1[i];
            }
        }
        for (var i = 0; i < a2.length; i++) {
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
        for (var i = 0; i < currentTiles.length; i++) {
            if (currentTiles[i].text_mode) {
                maybe_values.push(String.fromCharCode(currentTiles[i].val));
            } else {
                sure_values.push(String.fromCharCode(currentTiles[i].val));
            }
        }
        sure_values = sure_values.join('');
        var combs = combinations(maybe_values);
        var joined = [];
        for (var i = 0; i < combs.length; i++) {
            joined.push(combs[i].join('') + sure_values);
        }
        var perms = [];
        for (var i = 0; i < joined.length; i++) {
            perms = merge(perms, Array.from(permute(joined[i].split(''))).map(perm => perm.join('')));
        }
        var final = [];
        for (var i = 0; i < perms.length; i++) {
            if (en_dict[perms[i].toLowerCase()]) {
                final.push(perms[i]);
            }
        }
        document.getElementById("results").innerHTML = '<center><ul class="list"><li>' + final.join('</li><li>') + '</li></ul></center>';
    }

    $.getScript('js/en_dict.js', function() {
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
                e.preventDefault(); // prevent the default action (scroll / move)
            } else if (e.which == 32) {
                textMode = !textMode;
            } else if (e.which == 13) {
                updateResults();
            } else if (e.which == 8) {
                clearAll();
            }
        });
    });
});
