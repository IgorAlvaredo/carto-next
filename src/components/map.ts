import maplibregl from 'maplibre-gl'
import { Deck } from '@deck.gl/core/typed'
import {
  BASEMAP,
  CartoLayer,
  setDefaultCredentials,
  MAP_TYPES
} from '@deck.gl/carto/typed'

let deckgl: Deck | null = null
let basemap: any = null

const INITIAL_VIEW_STATE = {
  latitude: -14.8780831,
  longitude: -40.3031316,
  zoom: 4,
  bearing: 0,
}

const LAYERS_STYLES:any = {
  brabco_dep_emp: {
    pointRadiusMinPixels: 4,
    getFillColor: [200, 0, 80]
  },
  municipio_V02: {
    pointRadiusMinPixels: 3,
    getFillColor: [20, 0, 200]
  },
  brashoppings: {
    pointRadiusMinPixels: 5,
    getFillColor: [128,0,128]
  },
  censo2010pessoas1_estimativa_muni: {
    pointRadiusMinPixels: 2,
    getFillColor: [224, 247, 229, 0],
    // getLineWidth: 4,
    // lineWidthUnits: 'pixels'
  }
}

export function initMap() {
  // Create the Basemap
  basemap = new maplibregl.Map(
    {
    container: 'map',
    style: BASEMAP.VOYAGER,
    center: [-74.5, 40],
    zoom: 9
  }
  )

  if (deckgl) {
    deckgl.finalize();
  }

  // Create an empty deckgl instance
  deckgl = new Deck({
    canvas: 'deck-canvas',
    initialViewState: INITIAL_VIEW_STATE,
    controller: true,
    layers: [],
    onViewStateChange: ({ viewState }) => {
      const { longitude, latitude, ...rest } = viewState;
      basemap.jumpTo({ center: [longitude, latitude], ...rest })
    }
  })
}

export function setLayers(query: any, accessToken: string) {
  const apiBaseUrl = process.env.VITE_CARTO_API_BASE_URL;

  // Set the credentials for the specified access token
  setDefaultCredentials({ apiBaseUrl, accessToken });

  console.log('queries', query);
  // Create a new CARTO layer for the specified group
  const layers: CartoLayer<{}>[] = []
  // queries.forEach( (q: { id: any, source: any, connection_name: any }) => {
    layers.push(
      new CartoLayer({
        id: query.id,
        connection: query.connection_name,
        type: MAP_TYPES.QUERY,
        data: query.source,
        pickable: true,
        onHover: ({object}) => object,
        getTooltip: (object:any) => object,
        ...LAYERS_STYLES[query.id]
      })
    );
  // })

  deckgl.setProps({
    layers: layers,
    onViewStateChange: ({ viewState }) => {
      const { longitude, latitude, ...rest } = viewState;
      basemap.jumpTo({ center: [longitude, latitude], ...rest })
    },
    getTooltip: ({object}) => object && {
      html: `<div><b>${JSON.stringify(object.properties)}</b></div>`,
    }
  })
}




// Githiub para subir repo
// Query join trazer os dados baseado no recid
// Tooltip mostrar info relevante: população 
// Cores de variaveis em função da população // Extra
