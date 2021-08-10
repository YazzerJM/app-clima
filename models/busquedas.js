const fs = require('fs');

const axios = require('axios');

class Busquedas {

    historial = [];
    dbPath = './db/database.json';

    constructor(){
        this.leerDB();
    }

    get historialCapitalizado(){
        
        return this.historial.map( lugar => {
            let palabras = lugar.split(' ');
            palabras = palabras.map( p => p[0].toUpperCase() + p.substring(1));

            return palabras.join(' ');
        });
    }

    get paramsMapBox(){
        return {
            'access_token': process.env.MAPBOX_KEY,
            'limit': 5,
            'language': 'es'
        };
    }

    get paramsWeather(){
        return {
            'appid': process.env.OPENWEATHER_KEY,
            'units': 'metric',
            'lang': 'es'
        };
    }

    async ciudad ( lugar = '') {

        try{
            // Peticio http
            const instance = axios.create({
                baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${lugar}.json`,
                params: this.paramsMapBox,
            });

            const resp = await instance.get();
    
            return resp.data.features.map( lugar => ({
                id: lugar.id,
                nombre: lugar.place_name,
                lng: lugar.center[0],
                lat: lugar.center[1],
            }));

        }catch(error){
            return []
        }

    }

    async climaLugar( lat, lon ) {
        try{

            const instance = axios.create({
                baseURL: `https://api.openweathermap.org/data/2.5/weather`,
                params: { ...this.paramsWeather, lat, lon}
            });

            const resp = await instance.get();
            
            return {
                desc: resp.data.weather[0].description,
                min: resp.data.main.temp_min,
                max:resp.data.main.temp_max,
                temp: resp.data.main.temp
            };
        }catch(error){
            console.log('ERROR en peticion paramsWeather');
            return [];
        }
    }

    agregarHistorial( lugar = ''){
        // TODO: prevenir duplicados
        if(this.historial.includes( lugar.toLocaleLowerCase() )) return;

        this.historial = this.historial.splice(0,5);

        this.historial.unshift( lugar.toLocaleLowerCase() );
        
        // Grabar en db
        this.guardarDB();
    }

    guardarDB(){

        const payload = {
            historial: this.historial
        };

        fs.writeFileSync( this.dbPath, JSON.stringify(payload));
    }

    leerDB(){
        const info = fs.readFileSync(this.dbPath, {
            encoding: 'utf-8'
        });

        if(info){
            const data = JSON.parse(info);    
            this.historial = data.historial.splice(0,5);
        }
    }
}

module.exports = Busquedas;