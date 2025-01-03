import { makeMerkleTreeAPI } from './merkle-tree/index.js';

export const TEST_ACCOUNTS = [
  {
    name: 'wallet-1731277116-1',
    type: 'local',
    address: 'agoric19265cz9jkld4gnndrqqt2fvexwtt2xzan00zrl',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'AnEGbxH55aKu/9zIbgVDV2qXC43bpIqtZdHTKV8BAM58',
    },
    mnemonic:
      'sugar canal sniff fruit photo asset elbow praise result hamster debris sport account cool vessel either guess nominee certain tone crew donkey shed typical',
  },
  {
    name: 'wallet-1731277116-2',
    type: 'local',
    address: 'agoric188gu9dkv0ey3h8c79n3xkdjr7aa7p9pw9rrtn5',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'AsMy9sdrQ7ORSha5nYaA5OinnBaXD/nanO+G4op3OX4c',
    },
    mnemonic:
      'iron taste nerve parade analyst album feel flush quarter travel capital almost guilt thing symbol fence slab odor very absurd swing cushion erosion myth',
  },
  {
    name: 'wallet-1731277116-3',
    type: 'local',
    address: 'agoric1zvkurdadzu0h5dmvrh2hgjj50k55dhwa247rx6',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'A5X9LgZ7Uf81IOKy+mYuuU5lKLWx72OhMIR9DqMtzP2t',
    },
    mnemonic:
      'glare orchard detail december kiss child fun orient duty bomb accuse awful fancy stool idea coral dust convince order candy settle layer omit law',
  },
  {
    name: 'wallet-1731277116-4',
    type: 'local',
    address: 'agoric1hcangx770kzv2ysjp7gegnan7p2kcx52jadwya',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'A/dyU0pT3+pdmKQNGFb+penGQowpbI6GcCmDd4EKwynE',
    },
    mnemonic:
      'express write casual evil digital oppose job manual actor space cycle what beef estate ranch fish video polar rely together census seat figure addict',
  },
  {
    name: 'wallet-1731277116-5',
    type: 'local',
    address: 'agoric19s266pak0llft2gcapn64x5aa37ysqnqzky46y',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'AwSxb3Rltxqvz7fz3iF6tzNZrjBnCfHAWt8mBHV6F2ZM',
    },
    mnemonic:
      'defy fox marble brand loyal labor salt country kind leg acid claim laundry treat cruel real hundred escape camera pelican gallery student essay veteran',
  },
  {
    name: 'wallet-1731277116-6',
    type: 'local',
    address: 'agoric1s76tmnvcrxjvwxng7gdh9vgewre5kafdlqdryn',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'A/jJvVOyO2uB4206xaU8QmAPodJZsIVsdV9Dg7iuq9AU',
    },
    mnemonic:
      'beauty fringe enter camp arch poem odor legal inject cushion alpha title few runway coyote flavor pass assume taxi army note pill leg best',
  },
  {
    name: 'wallet-1731277116-7',
    type: 'local',
    address: 'agoric1slr5nm0f3v6zw3ne77ldu4m60gf3rd6vw2s8mp',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'Awy4hvPX3Iq4LsNdqxvCvMXv9gcpC9gVkkjsV2eaPykI',
    },
    mnemonic:
      'figure flush uphold great wing valid hazard stock capable course wine person van carbon nephew bone pilot famous snap shine wave remind always favorite',
  },
  {
    name: 'wallet-1731277116-8',
    type: 'local',
    address: 'agoric1p0h40ra2v7n2vkdjhdzra6daqzf6u66lmq8tlh',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'Ahm7IXGnYy8JysfiHP7xXazHnEbMkZczIjw/jBG2fory',
    },
    mnemonic:
      'tip topple reunion weekend inquiry document uniform ocean yellow hip truly habit dash welcome intact volume panda crop together record column speak save slice',
  },
  {
    name: 'wallet-1731277116-9',
    type: 'local',
    address: 'agoric1ppdynxh9msx529zvd4lzpyutjsvxvcktujv9lw',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'A7jG1NqUSZVfYzo6VQxbP7EBCRLanYMAFFmSgxWkLUtN',
    },
    mnemonic:
      'combine dune enroll able primary slush frown inflict hurt option soap cage suspect kangaroo misery catalog fence story quit symbol long genuine valley elder',
  },
  {
    name: 'wallet-1731277116-10',
    type: 'local',
    address: 'agoric13g79zexugr7c6xr0zutv0jshkq30hawv363aej',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'AsbgPBHCEYc3haCltruUi1tWFiF/kOVfdIncKx/7JTvW',
    },
    mnemonic:
      'measure motion sketch muffin divorce crystal boil token ice stuff select clean gospel license theory dice winner stand detail brown glance stone myth wet',
  },
  {
    name: 'wallet-1731277116-11',
    type: 'local',
    address: 'agoric1qjqe6qpsccc2mndg72l0w4snhmgdhp5djvsn8f',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'A1lBApRSW/pjkSoi94a6pASihcgC952pKiDmw8PCmHVU',
    },
    mnemonic:
      'loud resemble brand tag visual organ naive analyst orchard ready burst disease dumb merit crouch issue unit seven lesson cute arm zone fade usual',
  },
  {
    name: 'wallet-1731277116-12',
    type: 'local',
    address: 'agoric1l5cyvac9d8p27q2ud4a4rc2msd3yd7a4vnnqr2',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'Ax9Tybq6UPIHBabQ+Yn0ZXwlSfCkoNa0Xn1QFspQuJQs',
    },
    mnemonic:
      'dash art blue pill raw wrist wonder slide will abuse wife fringe output nature grunt island wash ancient wrestle already prosper twelve future clarify',
  },
  {
    name: 'wallet-1731277116-13',
    type: 'local',
    address: 'agoric1n3w8f05ra0y0ruy6aa8su08tfd39hpwpsmzqee',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'A8kNldATTV7PmWfjcP8xq242VPK8ZLhGGYlVw+RW5cl3',
    },
    mnemonic:
      'sword image seed hobby behind yellow again express tape phone execute pumpkin retire board response polar size shrug shiver champion tongue heart forum truth',
  },
  {
    name: 'wallet-1731277116-14',
    type: 'local',
    address: 'agoric1glvzdn7950r5m7j2ynjv2ur29rl24mvsmdurg8',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'AlVOXQfB8PXvGfy3ROtVWJYLJTV6MkVNg4Fg/qTW7AyK',
    },
    mnemonic:
      'cement limit bachelor claim absurd trouble program magnet essence dog husband scrub swap chicken deputy motor million mutual young divide clap neck silent invest',
  },
  {
    name: 'wallet-1731277116-15',
    type: 'local',
    address: 'agoric13f27km4ats0ddt09hlnz62qwhwuglvy585aumy',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'A12neOEkOrWlakYmfu0KKvsyF5FBzSTZC03XHKJtJf1L',
    },
    mnemonic:
      'slot cushion fox ship fish flat maximum soldier dish plunge favorite dish sustain silk settle wink crawl idle reform eager song twist foster solve',
  },
  {
    name: 'wallet-1731277116-16',
    type: 'local',
    address: 'agoric1gj4adjt653d6hnww0755wzarhnmdfsasp7ee0s',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'A/6BuDnISiorZDL4k6GPAQ+O0+PAXi+HX9DCuJSX7vo3',
    },
    mnemonic:
      'effort industry change trim elbow staff science sunset black cause sunny sausage remind gauge mix pen vast author poet quick ride abstract veteran seat',
  },
  {
    name: 'wallet-1731277116-17',
    type: 'local',
    address: 'agoric1v4l4z4pd4wxz74xg4ezffjgq3qlu7xz63s7j3p',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'AwoqLWc/WzJCWYfQwbU1Y6flRf3A9EAr+zes6LoitA2Y',
    },
    mnemonic:
      'come slab hawk sing prison goddess sorry arm betray jewel heavy mule vague kitten habit daring slow ride lobster diesel clock venture rebuild asthma',
  },
  {
    name: 'wallet-1731277116-18',
    type: 'local',
    address: 'agoric13mhm3a8w8lt7ptslwjjm806jmwq5n2yt45lkat',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'A4UNUqfBJSK0IpjSPbJ5CxbNY/R3oKL8cBRNdsEstR4e',
    },
    mnemonic:
      'video unfair sea aerobic spell element vague trial solar day drum army cricket warm enter sad cradle razor master rural allow debate satisfy gauge',
  },
  {
    name: 'wallet-1731277116-19',
    type: 'local',
    address: 'agoric1qlxazdvc79a9nxl8uhr88njrwp2psxx0s5dls0',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'AhXLKwQB8v+FiR+Dy0dhBo0F9430CuLi8qwALU2Q7smC',
    },
    mnemonic:
      'buzz ramp window fit bronze forward dose discover inspire shadow segment lesson program best pitch snack scissors bid path fence moment patrol seven draft',
  },
  {
    name: 'wallet-1731277116-20',
    type: 'local',
    address: 'agoric1cww6mpazl8epxk029mc64f7pm66e885z6hn26s',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'A973wY6QrKUEV/rc33x1mu7pWAfCYjwJGAKLFgWz1tZo',
    },
    mnemonic:
      'purity pond wing hotel prize material shield fee connect sphere wreck around size hedgehog remember crumble olive transfer insect useful sleep unknown detail garbage',
  },
  {
    name: 'wallet-1731277116-21',
    type: 'local',
    address: 'agoric1g2d2nt5a9m4qg6t3ta3pqa6ftlnz6zvywhadrn',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'A1xpDVrl2LUWbSJHDAtbGS4o247onKmFVV/K2xicrVpm',
    },
    mnemonic:
      'shed wedding problem trumpet walnut hungry east cargo almost humor never grief business egg nose idea rebel liberty smooth tired song half travel long',
  },
  {
    name: 'wallet-1731277116-22',
    type: 'local',
    address: 'agoric1djwjsjel7q58ufusu989q0784m46pd06v9e3aw',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'AlH5crvUD1L8CVAeZyLIPsh3C6r0xuMUg/dgWweH4RQS',
    },
    mnemonic:
      'spin any man angry outer mammal opera toast cream catch cruise broken glance question power mechanic atom heart else tobacco motor blue quick fun',
  },
  {
    name: 'wallet-1731277116-23',
    type: 'local',
    address: 'agoric17qysg7zuue64kxjd484jc8n54n6mftanfq7ddz',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'Ai930POJ/WpOeU4iV6LAfbjDEHN1i+0AP5UGrVu+mU5x',
    },
    mnemonic:
      'cushion shop advice usage zoo across false average jar season antique portion cage senior like nurse march recipe early achieve visa evil multiply stem',
  },
  {
    name: 'wallet-1731277116-24',
    type: 'local',
    address: 'agoric1zmajr36xrjdkl94pkattrhk5gs8859grqvru4m',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'A4vC6xjdZSGzUMGdKx6qnHALzZh80yUZ9hTTW2OpHLLT',
    },
    mnemonic:
      'shaft lift when canoe online hawk island divorce claw pistol average patient sail hurdle assault radio argue surround coin anxiety become glance measure matter',
  },
  {
    name: 'wallet-1731277116-25',
    type: 'local',
    address: 'agoric1v3tg3nk8r4ndawqx9gfx808rda4d5dzx6jkw6j',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'A6Pq2414VsYaJyQ+O4nIZcIjxd7yfrMT9m3M2ylxR0Zi',
    },
    mnemonic:
      'sample key settle bachelor pole ski bird idea town maximum refuse quiz grow twist danger exit demand remind phrase receive shine skin winner keen',
  },
  {
    name: 'wallet-1731277116-26',
    type: 'local',
    address: 'agoric1s2dvk5xxnwz7un7uareh63cc3g6y8l7vnjr4d9',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'AmwO+S7BHHNEehFnBGqsQlgF54LcN2fgm2LPImoVjAEK',
    },
    mnemonic:
      'forest earn wool rate metal eye seek wealth load chunk fence maid winter glow cup pull until smart kangaroo real forum trophy artist bench',
  },
  {
    name: 'wallet-1731277116-27',
    type: 'local',
    address: 'agoric1t35nlveyzw2kjuall3h78c5t8qcsdlgu2qgj2j',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'AwGRazLdf3C0jfSEjWTu3sSwW1cPsJRKpAHctRYv9QGq',
    },
    mnemonic:
      'possible icon liar liberty dentist turkey junk wreck aerobic task front submit suspect office apology open notice dress dance winter buzz myth wine seat',
  },
  {
    name: 'wallet-1731277116-28',
    type: 'local',
    address: 'agoric1q3f46v0mawgjp4vdc5q5g03xxcdh5a0r366z29',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'A4VYqNxelNd7h8xWlZu/IqgGv30hduRuhygCMYQpZyk+',
    },
    mnemonic:
      'club invest capital assist trumpet salt hair fun can frequent reunion rent sick bone grass near old resource park what broken quality coffee appear',
  },
  {
    name: 'wallet-1731277116-29',
    type: 'local',
    address: 'agoric1kq8t9szdreha96sz3459u0lwnlnzqae8n3jpav',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'AtsvAASOMb2wcG1rODyFkEbE5fIOBGkxqJcXw9ltH7lm',
    },
    mnemonic:
      'fog draft kit liberty nest polar media ready feel aware illegal cherry insect palace brave sentence focus metal engage total usage virtual organ online',
  },
  {
    name: 'wallet-1731277116-30',
    type: 'local',
    address: 'agoric1vxp5xrggfxudfjcaszggjjpwwsa9yhdmf2km54',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'Ai3MUBar+m8r6mOmtOl7uqWD5GNW2gDpLvl+WP+PBBfs',
    },
    mnemonic:
      'fantasy crowd uniform cause help rely exile enemy hammer region annual net uncle actress hair draft shoulder mosquito category limb remember tornado dog aware',
  },
  {
    name: 'wallet-1731277116-31',
    type: 'local',
    address: 'agoric1plnchjvf9akf3v45qawxyv4muz39q3j3hyl5ay',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'AkCXq3XqGUeiPpAAGHLCRjFcxOZIr25af8fx6OY6JRoX',
    },
    mnemonic:
      'mistake camp soul dirt symptom please alter pledge maid reopen olive alpha vivid famous add cup december place tourist wash stay solar business drill',
  },
  {
    name: 'wallet-1731277116-32',
    type: 'local',
    address: 'agoric1grgeqgr7meupg32kwyvhugusuuearz4sfqcw24',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'Ag2mbQt26xaZOICLVAIrlDN6FxGIAQ1VmbElwErz7RFO',
    },
    mnemonic:
      'garden giraffe ancient three frog now luggage sustain shallow better banana more wish knife start embark hard swim toast empower verb maple access glad',
  },
  {
    name: 'wallet-1731277116-33',
    type: 'local',
    address: 'agoric1m889vtfv5u5d3qqf7jxer37nhjpfmspwwp5xf8',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'AnkRxIKjl+W0oTMkwWjwO5SqOfoStODFtUEyKpxSBZjy',
    },
    mnemonic:
      'fuel armor cover muscle work globe glue motor error hub spoil humble wear into retreat truly reform copy friend order crystal valve rubber inquiry',
  },
  {
    name: 'wallet-1731277116-34',
    type: 'local',
    address: 'agoric1cre0r0ca82jfkl4truacs533zt3s44lk95d5um',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'ArDOFdX1awQmdwa4xV3szreE++Li+a9RqakbYkYPE2Aq',
    },
    mnemonic:
      'pulse earn damp symbol minor diesel exit current first tennis onion report absent bench august category lady dismiss fit carbon one warfare lonely stuff',
  },
  {
    name: 'wallet-1731277116-35',
    type: 'local',
    address: 'agoric1eytqskey3uy672pxc74uezs7lrya3nndqfmned',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'AlBSeEXb0J3LZzCj3m6Hdi426TWnfH+r9ABDRuVDa43I',
    },
    mnemonic:
      'pet destroy rent broccoli garden lumber crisp spot shove merit borrow six foster inside essay student half detect guilt firm suffer learn device indicate',
  },
  {
    name: 'wallet-1731277116-36',
    type: 'local',
    address: 'agoric15y9czct2jd0wtg8s443j006y6c6mjqqtqte5g4',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'A/Uyj08FKei1lIbBnzvUM2067cpqe11F6dbxmUnzQMyt',
    },
    mnemonic:
      'feature learn seek disagree wife code area idea general drastic normal antenna mad hip coin cement wild near exact behave come make cluster reveal',
  },
  {
    name: 'wallet-1731277116-37',
    type: 'local',
    address: 'agoric1kv7smunrm3f4h4kj7yakkjtdwph8njvrc56hhf',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'AnMJ0g+uG7tnba3l/TOcs+wKNs5WzSBmStLJCSFxBRbj',
    },
    mnemonic:
      'alcohol session zero velvet sun correct scatter glory vacant bag any final crew clarify holiday impulse nature update decorate fabric drip damage gospel expect',
  },
  {
    name: 'wallet-1731277116-38',
    type: 'local',
    address: 'agoric13t0ug0j7mm2j7a9ej76d9qxkue32373gfmpx4u',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'A46E4arFVtqkuF9Brl7E8VrK6mKZMk19x+VFuSBJcKzq',
    },
    mnemonic:
      'improve borrow life scout renew party kind endless float bridge sure august exercise kit present comic relax replace will blame print buffalo engine tube',
  },
  {
    name: 'wallet-1731277116-39',
    type: 'local',
    address: 'agoric1waejkeyppcvlqqzd6tknuqxx6v3xedsh3v8xx7',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'AhaK4i6VB5lMP/f3G1sP1EaNUKSlRONTwfOx+8JiDVuj',
    },
    mnemonic:
      'nominee luxury subject mirror holiday suit area scatter spy menu match over provide hamster anger wedding fury tip put medal symbol firm modify renew',
  },
  {
    name: 'wallet-1731277116-40',
    type: 'local',
    address: 'agoric16yawzl7umqheral694y844f8w83dwdpne3pgcw',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'AzYQ61L23dauDPGkaKaXynwXJ1aJCVBNCt9YXGGLiLAG',
    },
    mnemonic:
      'wrist clay benefit secret camp lucky donor cruel lamp danger noble ostrich dose rude cup climb reflect axis drum awesome hard submit stay truck',
  },
  {
    name: 'wallet-1731277116-41',
    type: 'local',
    address: 'agoric1vtmukazn25jc02ck3tvxx8j3xw0vj4nln88pm6',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'Akf8HDcDo/OEMdVfPDzEKnBU47GO5zqo5mih5CoSbxaa',
    },
    mnemonic:
      'wait lazy safe provide deal stone bread spatial banana vast burden draft wall enrich size puzzle peasant tree melody nation cargo vendor absent phrase',
  },
  {
    name: 'wallet-1731277116-42',
    type: 'local',
    address: 'agoric1unywh6rslqqeft3yr0kzkfuer89s6kvcus2mxn',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'AoaCOfOT8GBLD0PGi/EAX1ERnCamRi5sjfEXAHQas4bY',
    },
    mnemonic:
      'spy young flash spot brush warm sheriff evil burst soft tell economy celery maze convince high leader squirrel during shield math anger initial head',
  },
  {
    name: 'wallet-1731277116-43',
    type: 'local',
    address: 'agoric1yz0x6ga6jkukv8u6sgqthdq4dgmx8jhj4z3n6k',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'AuL3JcIysw0h/KKrufiDqVr4XTr6LHupcLtL8f+8UV2C',
    },
    mnemonic:
      'matrix beauty cheese sand lounge enhance practice gym aisle clarify pig lava code yellow raw orient survey old roof oppose cave girl duty truck',
  },
  {
    name: 'wallet-1731277116-44',
    type: 'local',
    address: 'agoric19r8fwg238lt97h37qcz4r8kdqsfup35l5e59qw',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'AvFP8iNzPv1df7wBObQhpLaxq69ntENt6nKBzRLc6IUE',
    },
    mnemonic:
      'pill canal sphere repair what focus post embody minor hill hundred announce devote maple smile absurd various fiscal scrap nurse goat pistol scrub very',
  },
  {
    name: 'wallet-1731277116-45',
    type: 'local',
    address: 'agoric1txuldrseq4xj47fat5czcsnfy5mtx7ultwv9nd',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'ApuVUTxYn60N4a+gfzGOb6nKveOEJ5t0yVZ+JqPExhOI',
    },
    mnemonic:
      'flower pledge believe reduce speak jeans blossom ethics latin boring expect elite stove grow ski scheme badge aspect dad nose that pigeon embrace sniff',
  },
  {
    name: 'wallet-1731277116-46',
    type: 'local',
    address: 'agoric1f0vhznds65ls3cr20kjp9xn3lvuc0c43ujqu38',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'AslAaBH6ENj/bn8SHi0noItPpZn0j/T4oQ+SX1GhK3r9',
    },
    mnemonic:
      'zoo salute gospel swing theory brown decrease wage harsh couch smart volume light inch alone camera promote pause merge tortoise snow wheel cheap approve',
  },
  {
    name: 'wallet-1731277116-47',
    type: 'local',
    address: 'agoric13wm7ce9qhkgp345yuhfec4makg7nept2y93agy',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'Axq9Hp88EqPSbx7QOLzEa8LHGz1YcCr4f89wqHqpl/SA',
    },
    mnemonic:
      'fabric negative diet outer blood parent soul whale inmate fly lamp scare salon half cigar kit object uniform match into scan chronic reflect arena',
  },
  {
    name: 'wallet-1731277116-48',
    type: 'local',
    address: 'agoric1hm6evatrekylxt5dlme0zvec2l2lay05uhzl65',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'A2eLke88RBlMiuVtjlaXyJG+7bntFA2hlEACru4ktXuu',
    },
    mnemonic:
      'soup distance notable mystery excess arrow tornado food nature age demand liar awake affair deal entry universe scout dial notable nice physical net derive',
  },
  {
    name: 'wallet-1731277116-49',
    type: 'local',
    address: 'agoric1j9c624lvftqlkynkz0g0458ckddvr6ch8a06hz',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'AhJR6V+O30NMde/SoHIgJVh3DGp4PBXZBUApShZ9eEAp',
    },
    mnemonic:
      'resist hello input once bulk wreck autumn such you calm crucial jazz planet kick taste little bag coil bring convince honey sense trouble rate',
  },
  {
    name: 'wallet-1731277116-50',
    type: 'local',
    address: 'agoric1knek3g43qldr9qtzhrj7j028nj2gpqjchdkyta',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'Azchw886rbMNuttz51CkX9ChleJPRiQvNFP/N1lIJB3h',
    },
    mnemonic:
      'rifle grief peace slow science radar custom tail pudding lava machine leisure mask water globe assume hand celery index address work burst eyebrow bring',
  },
  {
    name: 'wallet-1731277116-51',
    type: 'local',
    address: 'agoric1xe40lz352spr8wepew9yskr2ta7f4yr4uxnchn',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'AouowtE1DCBGDfdFw/XryM+loE79z8IyoUmKxPox7Fd5',
    },
    mnemonic:
      'convince will enrich bright assume bone attack rookie say universe art require try survey saddle path used night once upgrade noise air tape dutch',
  },
  {
    name: 'wallet-1731277116-52',
    type: 'local',
    address: 'agoric1xcxlf29w7cna9fmnt6l9k7zs2aqxej5vns8rsj',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'A6cMaO6jDNHDvKuyKorpDdWKWrqmRg3btYFJwuMFp/kO',
    },
    mnemonic:
      'sail pool alcohol mouse narrow sausage invest inform oven battle rival perfect wheel monitor pumpkin december shallow skirt trouble slice room school novel cycle',
  },
  {
    name: 'wallet-1731277116-53',
    type: 'local',
    address: 'agoric18wuhds0pul2h60skx89nped7cpxryffxp5c0g7',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'AzZlpZuxp9g92dHvaVZppk0XQYXriHjwL8bp0bWNuGRM',
    },
    mnemonic:
      'plastic ship inner knee admit brief income wire horror spawn burden screen fringe athlete cabin goddess hard animal valve dice tomorrow still wash silent',
  },
  {
    name: 'wallet-1731277116-54',
    type: 'local',
    address: 'agoric1jxc6dj6wn82plvxwvc45ke7pyg70emu6nh4u25',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'An9F19nHIiB3k3fl42Zdv9hn1oNKU4cQGMp86wrA54oC',
    },
    mnemonic:
      'receive permit draft lecture crumble love obtain vivid family lens review worth replace barely rack bar now phrase lawn melt pelican fun school fantasy',
  },
  {
    name: 'wallet-1731277116-55',
    type: 'local',
    address: 'agoric1hatrhhlt7z3nc36n95gfe9jujlh2dv364w8asq',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'A8bIe23JymRrTSnvXNz7x7TR9BQE6MlcWk4LP2Lki8Fp',
    },
    mnemonic:
      'giraffe exact judge enable security predict display steel manage lumber two science foot chapter food peanut unveil rather symbol pause unable impact demise swim',
  },
  {
    name: 'wallet-1731277116-56',
    type: 'local',
    address: 'agoric1gv62yn35whmhceky7rxhv7gas2cg2n77vkckjw',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'Am+zeREWfnejPZtYy/WLb/zXQDL475KGtyGQVJALup6l',
    },
    mnemonic:
      'divert art boss basic pitch human erode frown market drop movie tissue large random man erode grit proud wage loyal slice learn sleep advance',
  },
  {
    name: 'wallet-1731277116-57',
    type: 'local',
    address: 'agoric1w6c4yekudy0rzyr5xjf4hws8s26mpmptrn8slk',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'A1St7UxhQrtKL9hBZDkRPsPgwBMe5Wg9k+QsAfyzW1DK',
    },
    mnemonic:
      'fancy measure dance soccer acquire soft water cover ritual bless series broken rose remain atom destroy cousin lens correct another neglect party mechanic entry',
  },
  {
    name: 'wallet-1731277116-58',
    type: 'local',
    address: 'agoric1kpzl42hac8psqh9eg9tgenvc8v4fw34v8mp6yy',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'A0c0kfNt23XKwplydzDUdkcnUyfjZNM9d+VxQsOefKsq',
    },
    mnemonic:
      'stem fancy pretty surge plastic marriage measure chase ranch deliver boy deal rather consider humble vivid deposit bone spy pond rib black morning patch',
  },
  {
    name: 'wallet-1731277116-59',
    type: 'local',
    address: 'agoric12pnwkq8n2mvymy8qvr9zn5g4tmjk062j0yln20',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'AhqSk5n+KGeL6JDz3uRGd2iSsbs/C4iUnzlln4SsxMbZ',
    },
    mnemonic:
      'citizen drastic physical hungry unknown effort foam follow loud cram hollow across flight rich render salt enrich only message carbon bean behave neither pulp',
  },
  {
    name: 'wallet-1731277116-60',
    type: 'local',
    address: 'agoric1w8ptf03klpkhscrk486e8qj4ajrz9mgapr2z93',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'A2gr9UwYP7KWDpucoGHRmszSYUYkF5rFqSiCtH3x94an',
    },
    mnemonic:
      'fragile race region eight noodle swarm boil caught coyote east deliver true aerobic cute radar confirm animal math essence broom together flavor month spider',
  },
  {
    name: 'wallet-1731277116-61',
    type: 'local',
    address: 'agoric1srjt3ujmqeehky39m4ng9a39h0t74dlcx58tsd',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'AgP34Jba6N0DXasWqjiWcl8l5m9rJsL6iem7pDp+kfw2',
    },
    mnemonic:
      'load antique era taxi buddy word elegant alley electric square lion input believe canal stage calm immune trouble dilemma thing lunar hockey bundle effort',
  },
  {
    name: 'wallet-1731277116-62',
    type: 'local',
    address: 'agoric1pnuwunt8gnptylzhx2y3x39scycglr6v3sjyrx',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'AnO+NCA3qsnqLqLSM5Tl1zAHKOir7+N6ku/40cWteKeX',
    },
    mnemonic:
      'buyer spice alert during security pair leave dawn ice adult exist blanket tomato slam fruit icon main child pass effort argue depart hollow obscure',
  },
  {
    name: 'wallet-1731277116-63',
    type: 'local',
    address: 'agoric1wap8utnlnmw29am2h6j9hrm6u3h7ufdd6awf8z',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'Ahc2kEiBfClZzSCyeUSRnvdtsJguL5oSpGf3z86I4ND9',
    },
    mnemonic:
      'roast riot coconut crouch jewel twist parent armed usual hour armor ivory shell network volcano float under extend above worry essay family ranch spatial',
  },
  {
    name: 'wallet-1731277116-64',
    type: 'local',
    address: 'agoric1wv7sjjner9jj02ufqzejyas4fa5cdh3h04ck85',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'A+jFtFcSE5Luc2EKp7dAPArEd7A9EP3rpJP0xfV+sRWC',
    },
    mnemonic:
      'gold hawk slide neither session dial rely fence happy claim whip quiz orchard exercise seven increase fruit gather teach trigger glove model decrease pretty',
  },
  {
    name: 'wallet-1731277116-65',
    type: 'local',
    address: 'agoric1gv7dm4t8cduedqtjh4g8p6ffvq52cjl2lnqqru',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'AsZMqtFPbttZvxIgKZ2A8v9eJXdw3KpzjmQoOySd2suE',
    },
    mnemonic:
      'easy pen educate amount fabric candy angle squeeze race bomb apart control arrest best recipe fresh connect beyond meat victory school sudden lock patch',
  },
  {
    name: 'wallet-1731277116-66',
    type: 'local',
    address: 'agoric16h5kzaf0rhh4usx3pj4ywe7zwrtsrztsgpsyhh',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'AqAjb3t8vzXY+/NsAHSJ3cdGsAxHAzKqaoTGGQVf7D8/',
    },
    mnemonic:
      'front divorce suggest tunnel copper audit own soft attack dash woman hurry salad control purse siren pyramid reveal belt attitude rude entire jealous portion',
  },
  {
    name: 'wallet-1731277116-67',
    type: 'local',
    address: 'agoric16jaf5sdhufn9dxkx3reffnpmmx8a3jfhu9q855',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'ApVAcGPhiuPsUWqz59t15Ziu+A5pUlsewm9dYZnCrdbI',
    },
    mnemonic:
      'question quality glimpse intact waste lottery stock drop equip bone office embark spawn notice album soda frown exchange typical friend lazy toe embark life',
  },
  {
    name: 'wallet-1731277116-68',
    type: 'local',
    address: 'agoric1z3yp75fy47e22tdqea5hu4347wk8e8gmftl7x6',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'ApA64XpAvJeDIsSk8K/b0DI6uEC7yX238WuUF4aenLCM',
    },
    mnemonic:
      'obey magic jeans purity post argue hungry labor lab either high apology check cave trial salute false talent include differ upper project cloth sound',
  },
  {
    name: 'wallet-1731277116-69',
    type: 'local',
    address: 'agoric1tqx99jys99r36gfewvm4qlh4djerhrf7ehu3p3',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'AvKPerho/AWVf0Cw5LxyoN9Bmjx7VKrd3XLE/Wq9WhLe',
    },
    mnemonic:
      'define wine journey surround tag trial syrup twenty orient cement short blame mango loop attitude remain wage lemon space scene tennis rebel mind stamp',
  },
  {
    name: 'wallet-1731277116-70',
    type: 'local',
    address: 'agoric10p5vjffwe2w7js3ypakcywf8sky5w5ghfam9a8',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'A0ERbaSoVMcMYr+1vqqOv2JPpbaN4P6a56IrS2uRbz+6',
    },
    mnemonic:
      'swarm hollow height journey soup margin toddler debris loan bright soup thrive market knife under candy win lawn stand ring limb step good promote',
  },
  {
    name: 'wallet-1731277116-71',
    type: 'local',
    address: 'agoric1jay5xaw2qfa0rdxacq2cgh6l9v63gc0nahsu5z',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'A7fJREMVhxjMH2MNQnvYVgiSviIs2sCXMzM+xddaLYbH',
    },
    mnemonic:
      'negative recipe live syrup distance doll vanish cliff penalty lecture relief ladder thank lock sample recycle grace curious warm toast index fire roof inmate',
  },
  {
    name: 'wallet-1731277116-72',
    type: 'local',
    address: 'agoric1n6n4ns35vfd687e02efzxd0x9e5aylvs57wqrp',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'A+dTkWY0vI4zbyjDU1cxf6ADkRygaJCfle2mRUk/iSLh',
    },
    mnemonic:
      'labor amazing attack issue that shell antenna test liquid peace major task choose tornado shy broccoli fiction hello fit edge route skin visit bicycle',
  },
  {
    name: 'wallet-1731277116-73',
    type: 'local',
    address: 'agoric14sh9hazzr44a09un6sxse92y23aa88w0z8n55n',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'A9Szak2PA5bn6IssRoubsKBwWeWqTFKIrXOjlK6utaiZ',
    },
    mnemonic:
      'gauge panel boring entire airport barrel apple print health impose black notice stumble shine tattoo plastic begin noise jar tornado blame budget regret ladder',
  },
  {
    name: 'wallet-1731277116-74',
    type: 'local',
    address: 'agoric1yqw6qp4krg739qklscathz9dw8ahjfwt0e29rn',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'A4cdsyWSZG9OOvUsL5KrL7OLNT+fHTK1bLLZVCKQADLC',
    },
    mnemonic:
      'street toss cry payment edge bicycle whip dizzy shiver right verify nut horror vibrant soon crawl tide want best drama group glimpse hockey stand',
  },
  {
    name: 'wallet-1731277116-75',
    type: 'local',
    address: 'agoric1xqcq3jhghywdmng84dkt2yj6k6rwlv03cp2lp3',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'AhNPMYk0EvzMWFp8ECZYrcvo7zIvt+iRP6mgZAL9fptu',
    },
    mnemonic:
      'wine habit giant blanket bacon enemy champion differ story measure inherit replace wide picture harbor change agent hero weird seminar genre street letter radio',
  },
];

const defaultPubkeys = TEST_ACCOUNTS.map(x => x.pubkey.key);
const merkleTreeObj = makeMerkleTreeAPI(defaultPubkeys, TEST_ACCOUNTS);

export {
  TEST_ACCOUNTS as accounts,
  defaultPubkeys as pubkeys,
  merkleTreeObj,
  makeMerkleTreeAPI,
};
