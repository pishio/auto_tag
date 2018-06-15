const taglib = require('taglib2');
const mime = require('mime');
const fs = require('fs');
const path = require('path');
const _ = require('lodash') ;
const readlineSync = require('readline-sync');

const addTag = async ( topLevelPath, albumDirectoryFileName, trackFileNames, imageFile ) => {
  console.log(imageFile);
  const albumName = convertDirectoryNameToAlbumName ( albumDirectoryFileName )
  for( trackFileName of trackFileNames ) {
    const titleAndTrack = separateFilenameToTitleAndTrack ( trackFileName )
    const prop = await createProp( titleAndTrack.artist.replace( /\.aiff/g , '' ), titleAndTrack.title, albumName, `${topLevelPath}/${imageFile}` )
    const result = await writeTag( `${topLevelPath}/${trackFileName}`, prop );
  }
}
const writeTag = async ( path, prop ) => {
  console.log(path);
  console.log(prop);
  return taglib.writeTagsSync( path, prop)
}

const createProp = async (  artist, title,  album, imageFilePath ) => {
  if ( imageFilePath.length === 0 ) return { artist, title,  album };
  try {
    fs.statSync(imageFilePath);
    return { artist, title,  album, pictures: {
      mimetype: mime.getType( imageFilePath ),
      picture: fs.readFileSync(imageFilePath)
     }
    };
  } catch(err) {
    return { artist, title,  album };
  }
  
}

const separateFilenameToTitleAndTrack = filename => {
  const spilitedFileName = filename.split(' - ')
  if( spilitedFileName.length !== 2 ) return inputArtistAndTrack( filename );
  return {
    title: spilitedFileName[0],
    artist: spilitedFileName[1]
  }
}

const convertDirectoryNameToAlbumName =  (directoryName) => {
  const spilitedDirectoryName = directoryName.split(' - ')
  return spilitedDirectoryName.length === 2 ? spilitedDirectoryName[0] : inputAlbumName( directoryName ); 
}

const inputArtistAndTrack = ( filename ) => {
  console.log( filename );
  const artist = readlineSync.question( 'アーティスト名' );
  const title = readlineSync.question( 'トラック名' );
  return { artist, title }
}

const inputAlbumName = ( directoryName ) => {
  console.log( directoryName );
  const albumName = readlineSync.question( 'アルバム名' );
  return albumName;

}
const readTopDirSync = async directory => {
  return fs.readdirSync( directory );
}

const readListAlbum = async directory => {
  return fs.readdirSync( directory );
}

const filterDotFile = fileName => {
  return !/^\./.test( fileName )
}
const pickImage = fileName => {
  return /\.gif$|\.png$|\.jpg$|\.jpeg$|\.bmp$/i.test(fileName);
}

const main = async () => {
  process.stdin.setEncoding('utf-8');
	const argument = process.argv[2];
  
  const albums = await readTopDirSync( argument )
  for ( let album of albums ) {
    const fileNames = await readListAlbum( `${argument}${album}` );
    let filterdfileNames = fileNames.filter( filterDotFile )
    let imageFile = filterdfileNames.filter( pickImage )
    await addTag ( `${argument}${album}` , album, _.without( filterdfileNames, ...imageFile ), imageFile );
  }
};


main();
