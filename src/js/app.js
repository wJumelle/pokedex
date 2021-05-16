//Fix regenerator-runtime error caused by async function
import 'regenerator-runtime/runtime';

/***************
 * CLASSES
 **************/
class Pokedex {
    constructor(lang, nbTypes = 0, typesArray = [], typesArrayConversion = [], typesArrayConversionReverse = [], typesArrayUrlView = [], nbVersions = 0, versionsArray = [], nbPokemons = 0) {
        this.lang = lang;
        this.nbTypes = nbTypes;
        this.typesArray = typesArray;
        this.typesArrayConversion = typesArrayConversion;
        this.typesArrayConversionReverse = typesArrayConversionReverse;
        this.typesArrayUrlView = typesArrayUrlView;
        this.nbVersions = nbVersions;
        this.versionsArray = versionsArray;
        this.nbPokemons = nbPokemons;
    }

    //Get Types List
    //Call function printListTypes(arr)
    async getTypesList(print = false) {
        const self = this;
        const urlTypes = 'https://pokeapi.co/api/v2/type/';
        const resTypes = await fetch(urlTypes);
        const types = await resTypes.json();
        const arrRejectedId = [10001, 10002];
    
        //Affichage du loader
        printLoader();

        for(const type of types.results) {
            let typeName = type.name,
                typeUrl = type.url,
                typeNameLang = '',
                typeId = 0;
            const resTypeLang = await fetch(typeUrl);
            const typeLang = await resTypeLang.json();

            typeId = typeLang.id;

            for(const namesType of typeLang.names) {
                if(namesType.language.name === pokedex.lang) {
                    typeNameLang = namesType.name;
                }
            }

            if(!arrRejectedId.includes(typeId)) {
                self.nbTypes++;
                self.typesArrayConversion[typeName] = typeNameLang;
                self.typesArrayConversionReverse[typeNameLang] = typeName;
                self.typesArray.push([typeId, typeName, typeNameLang]);
                self.typesArrayUrlView[typeName] = typeUrl;
            }
        };

        self.typesArrayUrlView['length'] = self.nbTypes;

        if(print) {
            printListTypes(self.typesArray);
        }
        return self.typesArray;
    }

    //Get Version List
    //Call function printListVersions(arr)
    async getVersionList(print = false) {
        const self = this;
        const urlVersion = 'https://pokeapi.co/api/v2/version/';
        const resVersion = await fetch(urlVersion);
        const versions = await resVersion.json();
        const nextVersionsUrl = versions.next !== '' ? versions.next : false;
        const arrRejectedId = [19, 20, 31, 32];

        self.nbVersion = versions.count;
    
        //Affichage du loader
        printLoader();

        //Récupération des premières versions (résultat limité à 20)
        for(const version of versions.results) {
            let versionName = version.name,
                versionNameLang = '',
                versionId = 0;
            const resVersionLang = await fetch(version.url);
            const versionLang = await resVersionLang.json();

            versionId = versionLang.id;

            for(const namesVersion of versionLang.names) {
                if(namesVersion.language.name === pokedex.lang) {
                    versionNameLang = namesVersion.name;
                }
            }

            if(!arrRejectedId.includes(versionId)) {
                self.versionsArray.push([versionId, versionName, versionNameLang]);
            }
        }

        //Patch pour obtenir les versions 20 à 34
        if(nextVersionsUrl) {
            const resNextVersion = await fetch(nextVersionsUrl);
            const nextVersions = await resNextVersion.json();

            for(const version of nextVersions.results) {
                let versionName = version.name,
                    versionNameLang = '',
                    versionId = 0;
                const resVersionLang = await fetch(version.url);
                const versionLang = await resVersionLang.json();

                versionId = versionLang.id;
    
                for(const namesVersion of versionLang.names) {
                    if(namesVersion.language.name === pokedex.lang) {
                        versionNameLang = namesVersion.name;
                    }
                }
    
                if(!arrRejectedId.includes(versionId)) {
                    self.versionsArray.push([versionId, versionName, versionNameLang]);
                }
            }
        }

        printListVersions(self.versionsArray);
        return self.versionsArray;
    }

    //Get Pokemons List From Type
    //Call function printPokemonsListFromType(id, arr)
    async getPokemonsListFromType(url) {
        const self = this;
        const urlPokemonsListFromType = url;
        const resPokemonsListFromType = await fetch(urlPokemonsListFromType);
        const pokemonsListFromType = await resPokemonsListFromType.json();
        const pokemonListLength = pokemonsListFromType.pokemon.length;
        const pokemonsListFromTypeArray = [];
        const pokemonsListFromTypeName = pokemonsListFromType.name;
        let nbPkmnLoaded = 0;
    
        //Affichage du loader
        printLoader('pokemonList');

        for(let i = 0; i < pokemonListLength; i++) {
            let pkmnLight = pokemonsListFromType.pokemon[i];
            let pkmn = [];
            const pkmnName = pkmnLight.pokemon.name;
            let pkmnNameLang = '';
            let pkmnId = 0;
            //let pkmnEvolutionChain = [];
            let pkmnTypes = [];

            const urlPokemon = pkmnLight.pokemon.url;
            const resPokemon = await fetch(urlPokemon);
            const pokemonDatas = await resPokemon.json();

            if(pokemonDatas['is_default']) {
                const urlPokemonSpecies = pokemonDatas.species.url; 
                const resPokemonSpecies = await fetch(urlPokemonSpecies);
                const pokemonSpecies = await resPokemonSpecies.json();

                //Récupération de l'id du pokemon
                pkmnId = pokemonSpecies.id;

                //Récupération du nom du pokemon en fonction de la langue du Pokedex
                const pokemonSpeciesNamesList = pokemonSpecies.names;
                for(const pokemonSpeciesName in pokemonSpeciesNamesList) {
                    if(pokemonSpeciesNamesList[pokemonSpeciesName].language.name === pokedex.lang) {
                        pkmnNameLang = pokemonSpeciesNamesList[pokemonSpeciesName].name;
                    }
                }

                //Récupération des types
                const pokemonSpeciesTypesList = pokemonDatas.types;
                let tempArray = [];
                for(let y = 0; y < pokemonSpeciesTypesList.length; y ++) {
                    tempArray.push(pokedex.typesArrayConversion[pokemonSpeciesTypesList[y].type.name]);
                }
                pkmnTypes.push(tempArray);

                //Récupération de la liste des évolutions d'un pokemon
                //ToDo For Fun

                pkmn['id'] = pkmnId;
                pkmn['name'] = pkmnName;
                pkmn['nameLang'] = pkmnNameLang;
                pkmn['types'] = pkmnTypes;
                pkmn['img'] = 'https://pokeres.bastionbot.org/images/pokemon/'+pkmnId+'.png';

                pokemonsListFromTypeArray.push(pkmn);

                nbPkmnLoaded++;
                printNbPkmnLoaded(nbPkmnLoaded);
            }
        }
        
        printPokemonsListFromType(pokemonsListFromTypeName, pokemonsListFromTypeArray);
        return pokemonsListFromTypeArray;
    }

    //Set Pokedex to local storage
    sendPokedexToLocalStorage() {
        const self = this;
        localStorage.setItem('pokedex', JSON.stringify(self));
    }

    //Remove Pokedex from local storage
    clearLocalStorage() {
        localStorage.removeItem('pokedex');
    }
}

/**************************
 * AFFICHAGE ET FONCTIONS
 *************************/
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const pokedex = new Pokedex("fr");
if(urlParams.has('type')) {
    if(pokedex.typesArrayUrlView.length == 0) {
        pokedex.getTypesList(false).then(function(){
            if(pokedex.typesArrayUrlView[urlParams.get('type')] !== 'undefined') {
                pokedex.getPokemonsListFromType(pokedex.typesArrayUrlView[urlParams.get('type')]);
            } else {
                console.error('ERROR TYPE UNDEFINED');
            }
        });
    }
} else if(urlParams.has('version')) {
    console.log('VERSION : ', urlParams.get('version'));
} else {
    let pokedexTypes = pokedex.getTypesList(true),
        pokedexVersions = pokedex.getVersionList(true);
    console.log('init : ', pokedexTypes, pokedexVersions);
}

//Affichage de la liste de tous les types de pokemons
function printListTypes(arr) {
    let globalContainer = document.querySelector('#global-container'),
        listTypeContainer = document.createElement('div'),
        title = document.createElement('h1'),
        listType = document.createElement('ul');
    
    listTypeContainer.classList.add('pokedex-container');
    listTypeContainer.dataset.pokedexContainer = 'typeList';

    title.append(document.createTextNode("Par TYPE ?"));

    arr.forEach((e,i) => {
        let tId = e[0],
            voName = e[1],
            vLangName = e[2],
            listTypeElem = document.createElement('li'),
            listTypeElemButton = document.createElement('button');

        listTypeElemButton.append(document.createTextNode(vLangName ? vLangName : voName));
        listTypeElemButton.setAttribute('data-pokedexDataType', 'type');
        listTypeElemButton.setAttribute('data-pokedexElemId', tId);
        listTypeElemButton.setAttribute('data-pokedexType', voName);
        listTypeElemButton.addEventListener('click', function(e) {
            let url = 'https://pokeapi.co/api/v2/'+e.target.dataset['pokedexdatatype']+'/'+e.target.dataset['pokedexelemid']+'/';
            console.log(pokedex.getPokemonsListFromType(url));
        }, false);
        listTypeElem.classList.add('type-'+voName);
        listTypeElem.append(listTypeElemButton);
        listType.append(listTypeElem);
    });

    listTypeContainer.append(title);
    listTypeContainer.append(listType);

    //on supprime le loader si il est en place
    removeLoader();

    globalContainer.append(listTypeContainer);
}

//Affichage de la liste de toutes les versions
function printListVersions(arr) {
    let globalContainer = document.querySelector('#global-container'),
        listVersionContainer = document.createElement('div'),
        title = document.createElement('h1'),
        listVersion = document.createElement('ul');
    
    listVersionContainer.classList.add('pokedex-container');
    listVersionContainer.dataset.pokedexContainer = 'versionList';
    title.append(document.createTextNode("Par Version ?"));

    arr.forEach((e,i) => {
        let vId = e[0],
            voName = e[1],
            vLangName = e[2],
            listVersionElem = document.createElement('li'),
            listVersionElemButton = document.createElement('button');

        listVersionElemButton.append(document.createTextNode(vLangName ? vLangName : voName));
        listVersionElemButton.setAttribute('data-pokedexDataType', 'version');
        listVersionElemButton.setAttribute('data-pokedexElemId', vId);
        listVersionElemButton.setAttribute('data-pokedexVersion', voName);
        listVersionElemButton.addEventListener('click', function(e) {
            let url = 'https://pokeapi.co/api/v2/'+e.target.dataset['pokedexdatatype']+'/'+e.target.dataset['pokedexelemid']+'/';
            console.log(url);
        }, false);
        listVersionElem.classList.add('version-'+camelize(voName));
        listVersionElem.append(listVersionElemButton);
        listVersion.append(listVersionElem);
    });

    listVersionContainer.append(title);
    listVersionContainer.append(listVersion);

    //on supprime le loader si il est en place
    removeLoader();

    globalContainer.append(listVersionContainer);
}

//Affichages de tous les pokemons appartenant à un certain type
function printPokemonsListFromType(typeName, arr) {
    let globalContainer = document.querySelector('#global-container'),
        listPokemonsFromTypeContainer = document.createElement('div'),
        title = document.createElement('h1'),
        listPokemonsFromType = document.createElement('ul');

    listPokemonsFromType.classList.add('pokedex-pokemonList');
    listPokemonsFromTypeContainer.classList.add('pokedex-pokemonList-container', `type-${typeName}`);
    listPokemonsFromTypeContainer.dataset.pokedexContainer = 'pokemonFromTypeList';

    title.append(document.createTextNode("Par TYPE ?"));

    arr.forEach(function(e){
        let listPokemonsFromTypeElem = document.createElement('li'),
            listPokemonsFromTypeElemId = document.createElement('span'),
            listPokemonsFromTypeElemName = document.createElement('h2'),
            listPokemonsFromTypeElemImageContainer = document.createElement('div'),
            listPokemonsFromTypeElemImage = document.createElement('img'),
            listPokemonsFromTypeElemTypesContainer = document.createElement('div'),
            listPokemonsFromTypeElemTypesList = document.createElement('ul');

            listPokemonsFromTypeElem.classList.add('pokedex-pokemonList__elem')

            //On gère id, nom, image
            listPokemonsFromTypeElemId.innerHTML = `<span class="pokemon-id">#${e.id.toString().padStart(4, '0')}</span>`;
            listPokemonsFromTypeElemName.append(document.createTextNode(e.nameLang ? e.nameLang : e.name));
            listPokemonsFromTypeElemImage.src = e.img;
            listPokemonsFromTypeElemImageContainer.classList.add('pokemon-image__container');
            listPokemonsFromTypeElemImageContainer.append(listPokemonsFromTypeElemImage);

            //On gère les types
            e.types.forEach(function(eTypes){
                eTypes.forEach(function(eType){
                    let listPokemonsFromTypeElemTypesListElem = document.createElement('li');
                    listPokemonsFromTypeElemTypesListElem.append(document.createTextNode(eType));
                    listPokemonsFromTypeElemTypesListElem.classList.add('type-'+pokedex.typesArrayConversionReverse[eType]);
                    listPokemonsFromTypeElemTypesList.append(listPokemonsFromTypeElemTypesListElem);
                })
            });
            listPokemonsFromTypeElemTypesContainer.classList.add('pokemon-types__container')
            listPokemonsFromTypeElemTypesContainer.append(listPokemonsFromTypeElemTypesList);

            //On insère les données dans le DOM
            listPokemonsFromTypeElem.append(listPokemonsFromTypeElemImageContainer);
            listPokemonsFromTypeElem.append(listPokemonsFromTypeElemId);
            listPokemonsFromTypeElem.append(listPokemonsFromTypeElemName);
            listPokemonsFromTypeElem.append(listPokemonsFromTypeElemTypesContainer);
            listPokemonsFromType.append(listPokemonsFromTypeElem);
    });

    listPokemonsFromTypeContainer.append(title);
    listPokemonsFromTypeContainer.append(listPokemonsFromType);
    globalContainer.innerHTML = '';

    //on supprime le loader si il est en place
    removeLoader();

    globalContainer.append(listPokemonsFromTypeContainer);
}

//Affichage du loader
function printLoader(type = 'general') {
    const loaderGeneral = '<div class="pokedex-container pokeball-container" data-pokedex-container="pokeball"><div class="pokeball"><div class="pokeball-button"></div></div></div>';
    const loaderPkmn = '<div class="pokedex-container pokeball-container" data-pokedex-container="pokeball"><div class="pokedex-cpt">Nombre de<br/>Pokémon(s) chargé(s) : <span>0</span></div><div class="pokeball"><div class="pokeball-button"></div></div></div>';

    if(document.getElementsByClassName('pokeball-container').length == 0 && document.getElementById("global-container") !== null) {
        //On supprime l'ancien contenu 
        document.getElementById("global-container").innerHTML = '';

        if(type == 'general') {
            document.getElementById("global-container").insertAdjacentHTML('afterbegin', loaderGeneral);
        } else {
            document.getElementById("global-container").insertAdjacentHTML('afterbegin', loaderPkmn);
        }
    }
}

//Suppression du loader
function removeLoader() {
    if(document.getElementsByClassName('pokeball-container').length > 0) {
        const globalContainer = document.getElementById('global-container');
        const pokeballContainer = document.getElementsByClassName('pokeball-container')[0];
        globalContainer.removeChild(pokeballContainer);
    }
}

//Mise à jours du nombre de pokemon chargé
function printNbPkmnLoaded(nb) {
    if(document.querySelector('.pokedex-cpt span') !== null) {
        document.querySelector('.pokedex-cpt span').innerHTML = nb;
    }
}

function camelize(str) {
    return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function(word, index) {
        return index === 0 ? word.toLowerCase() : word.toUpperCase();
    }).replace(/[\s+|-]/g, '');
}