require('dotenv').config()

const { 
    leerInput,
    inquirerMenu,
    pausa,
    listadoLugares
 } = require('./helpers/inquirer');
const Busquedas = require('./models/busquedas');

const main = async() => {

    const busqueda = new Busquedas();

    let opcion;

    do{
        opcion = await inquirerMenu();

        switch(opcion){
            case 1:
                // Mostrar mensaje
                const termino = await leerInput('Ciudad: ');
                
                // Buscar los lugares
                const lugares = await busqueda.ciudad( termino );

                // Seleccionar el lugar
                const id = await listadoLugares(lugares);

                if(id === '0') continue;

                
                const lugarSel = lugares.find( l => l.id === id );
                
                busqueda.agregarHistorial( lugarSel.nombre );

                // Clima
                const clima = await busqueda.climaLugar(lugarSel.lat, lugarSel.lng);
                
                // Mostrar resultados
                console.log('\nInformacion de la ciudad\n'.green);
                console.log('Ciudad:', lugarSel.nombre);
                console.log('Lat:', lugarSel.lat);
                console.log('Lng:', lugarSel.lng);
                console.log('Temperatura:', clima.temp);
                console.log('Min:', clima.min);
                console.log('Max:', clima.max);
                console.log('Como esta el clima:', clima.desc.red);
                break;
            case 2:
                busqueda.historialCapitalizado.forEach( (lugar, i) => {
                    const idx = `${i + 1}.`.green;
                    console.log( `${idx} ${lugar}` );
                });
                break;
        }

        if(opcion !== 0){
            await pausa();
        }

        console.log(opcion);

    }while(opcion !== 0);

    
}


main();