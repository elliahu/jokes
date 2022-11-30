import '/node_modules/chart.js/dist/chart.umd.js';

if (!localStorage.getItem('favorite')) {
    const favorite = {
        "Programming": 0,
        "Misc": 0,
        "Dark": 0,
        "Pun": 0,
        "Spooky": 0,
        "Christmas": 0
    };

    localStorage.setItem('favorite', JSON.stringify(favorite));
}


function makeCardSingle(joke, category, flags = {}) {

    let badges = "";

    for (const [key, value] of Object.entries(flags)) {
        badges += `<span class="uk-badge"><b>${key}</b>: ${value}</span>`;
    }

    return `
    <div class="uk-margin-top uk-card uk-card-default uk-card-body uk-width-1-1">
    <p>${joke}</p>
    <p class"uk-text-small">Category: ${category}</p>
    ${badges}
    </div>
    `;
}

function makeCardTwoPart(setup, delivery, category, flags = {}) {
    let badges = "";

    for (const [key, value] of Object.entries(flags)) {
        badges += `<span class="uk-badge"><b>${key}</b>: ${value}</span>`;
    }

    return `
    <div class="uk-margin-top uk-card uk-card-default uk-card-body uk-width-1-1">
    <p>${setup}</p> <p>${delivery}</p>
    <p class"uk-text-small">Category: ${category}</p>
    ${badges}
    </div>
    `;
}

window.onload = (e) => {

    let base = 'https://v2.jokeapi.dev/joke/';

    let categories = {
        'c-1': 'Programming',
        'c-2': 'Misc',
        'c-3': 'Dark',
        'c-4': 'Pun',
        'c-5': 'Spooky',
        'c-6': 'Christmas'
    };

    let blacklists = {
        'b-1': 'nsfw',
        'b-2': 'religious',
        'b-3': 'political',
        'b-4': 'racist',
        'b-5': 'sexist',
        'b-6': 'explicit'
    };

    let types = {
        't-1': 'single',
        't-2': 'twopart'
    }

    let go = document.querySelector('#go');
    let random = document.querySelector('#random');

    go.onclick = function () {
        let category = [];

        for (const [key, value] of Object.entries(categories)) {
            if (document.querySelector("#" + key).checked) {
                category.push(value);
            }
        }

        let lang = document.getElementById('language').value;

        let blacklist = [];
        for (const [key, value] of Object.entries(blacklists)) {
            if (document.querySelector("#" + key).checked) {
                blacklist.push(value);
            }
        }

        let type = [];
        for (const [key, value] of Object.entries(types)) {
            if (document.querySelector("#" + key).checked) {
                type.push(value);
            }
        }

        let search = document.getElementById('search').value;
        let number = document.getElementById('number').value;

        let finalURL = "";
        if (category.length != 0)
            finalURL = base + category.toString();
        else
            finalURL = base + "Any";

        var url = new URL(finalURL);

        url.searchParams.append('lang', lang);
        url.searchParams.append('blacklistFlags', blacklist.toString());
        url.searchParams.append('amount', number);
        url.searchParams.append('contains', search);

        if (type.length != 2)
            url.searchParams.append('type', type.toString());

        console.log(url.toString());
        fetchDataFromAPI(url.toString(), number);
    };

    random.onclick = () => {
        var url = 'https://v2.jokeapi.dev/joke/Any';
        console.log(url);
        fetchDataFromAPI(url, 1);
    }


    function fetchDataFromAPI(url, amount) {

        fetch(url)
            .then((response) => response.json())
            .then((data) => {
                if (data.error == true) {
                    UIkit.notification('Failed to fetch data!', 'danger');
                }
                else {

                    let modalContent = document.getElementById('modal-content');

                    if (amount == 1) {
                        if (data.setup)
                            modalContent.innerHTML = makeCardTwoPart(data.setup, data.delivery, data.category, data.flags);
                        else if (data.joke)
                            modalContent.innerHTML = makeCardSingle(data.joke, data.category, data.flags);

                        const favorite = JSON.parse(localStorage.getItem('favorite'));
                        favorite[data.category] += 1;
                        localStorage.setItem('favorite', JSON.stringify(favorite));

                    }
                    else {
                        for (let joke of data.jokes) {
                            if (joke.setup)
                                modalContent.innerHTML += makeCardTwoPart(joke.setup, joke.delivery, joke.category, joke.flags);
                            else if (joke.joke)
                                modalContent.innerHTML += makeCardSingle(joke.joke, joke.category, joke.flags);

                            const favorite = JSON.parse(localStorage.getItem('favorite'));
                            favorite[joke.category] += 1;
                            localStorage.setItem('favorite', JSON.stringify(favorite));
                        }
                    }

                    UIkit.modal(document.getElementById('modal')).show();
                }
            });
    }

    function getRandomColor() {
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
          color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
      }

    const ctx = document.getElementById('chart');


    function drawChart(ctx){
        let data = {
            labels: [],
            datasets: [{
                label: 'Favorite Jokes',
                data: [],
                backgroundColor: [],
                hoverOffset: 4
            }]
        };
    
        const favorite = JSON.parse(localStorage.getItem('favorite'));
        for (const [key, value] of Object.entries(favorite)) {
            data.labels.push(key);
            data.datasets[0].data.push(value);
            data.datasets[0].backgroundColor.push(getRandomColor());
        }
    
        const config = {
            type: 'doughnut',
            data: data,
        };
    
        return new Chart(ctx, config);
    }

    var chart = drawChart(ctx);

    document.getElementById('modal').addEventListener("hide", ()=>{
        chart.data.labels = [];
        chart.data.datasets[0].data = [];

        const favorite = JSON.parse(localStorage.getItem('favorite'));
        for (const [key, value] of Object.entries(favorite)) {
            chart.data.labels.push(key);
            chart.data.datasets[0].data.push(value);
        }

        chart.update();
    });
};