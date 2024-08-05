const testKeys = [
  {
    name: 'gov1',
    type: 'local',
    address: 'agoric1aa9jh3am8l94kawqy8003999ekk8dksdmwdemy',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'AlGGU+FJgSGdwXjG2tGmza5UFYQhoeWBlTzFK8YSk6nM',
    },
  },
  {
    name: 'gov2',
    type: 'local',
    address: 'agoric15r9kesuumyfdjtuj5pvulmt6tgr0uqz82yhk84',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'A98CowubQ7ui4BO++4NFvf4NxxjkQGAUo8787y3ipa06',
    },
  },
  {
    name: 'gov3',
    type: 'local',
    address: 'agoric1h3jpwr2tawcc4ahlez45qepy5mnwdnlps55xvr',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'ArcFg4+WNp7wpD8PlgOwB1gRIvuN9tkOz5S2yskZsTtp',
    },
  },
  {
    name: 'k10',
    type: 'local',
    address: 'agoric1zwpmfnlvv9w6dtcrjqe4pw7equms8tafkzg6g6',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'AumCSC1BRf+jKVxp+WteYiQLiUnhhBXEK+UZaGmsRwMO',
    },
  },
  {
    name: 'k2',
    type: 'local',
    address: 'agoric1mpgv8d8e8elf9jvuxawkwfd78xfkchhh30usjh',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'Aj0TgHj5Ib9k9YNT2uPRswhqYIcn2AHHRD1ciTik+XC2',
    },
  },
  {
    name: 'k3',
    type: 'local',
    address: 'agoric183qrncafg2pvd5qhuvxss3yhcjv667u9u0lq6r',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'Ayx9cYE21JpBXIBgCBbsG3XE3vA7obQ7YctETPqmm0ee',
    },
  },
  {
    name: 'k4',
    type: 'local',
    address: 'agoric150jjqz7dyk7qz788l2fwaqkeln8mpcv8qpj5wx',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'A9fjO10dHZMqsiWgrf9ez8b9uCaaIOKnk9XuyQpy5St+',
    },
  },
  {
    name: 'k5',
    type: 'local',
    address: 'agoric1c7m64tqypcq4aua9468cj74n2xya5hqc2nempn',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'AiVIqAJypnFOeT1TRl1nL26v35ixQ8f3oT5KLkXuDIb/',
    },
  },
  {
    name: 'k6',
    type: 'local',
    address: 'agoric1s5sppt3ww9y8alq87w0r8dcv4hnwrr2azk67nc',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'AwG+Hc60YzKr1VB8ZSemAuR7PcOXXKat95EKGXOgX8JA',
    },
  },
  {
    name: 'k7',
    type: 'local',
    address: 'agoric1dlwk40xtuhp9g3mazz8uul54mw7kpjxdrl6lkn',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'AlxOvPlMYVQeZWZ2iBMQX3+pt42lsOSIxAFIufK6tDIH',
    },
  },
  {
    name: 'k8',
    type: 'local',
    address: 'agoric1ffggq4gq0pr3gm9xjsa4s88p50pk22hfnap24n',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'AxbhH1YFTDFLHAtEyBzPJN6wjYedDpjCSCc96BzK1k7G',
    },
  },
  {
    name: 'k9',
    type: 'local',
    address: 'agoric163zkpc0gv6hafy6786939y84sj2f5gy5n20d04',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'A31gSxxrNrynvdEpiAIHLcKoOkna58GhZjCPkdJPQwyM',
    },
  },
  {
    name: 'may11',
    type: 'local',
    address: 'agoric1g6lrpj3wtdrdlsakxky4rhnzfkep23vgfk9esp',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'Ar+zTmVnp1l696gMJZZ2nF9tV4l75beK2hchMmki+DL0',
    },
  },
  {
    name: 'owens-key',
    type: 'local',
    address: 'agoric18tdsgyamdkcs0lkf885gp3v5slq3q5n455lett',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'A+tCAk6BFice/hlHWQaGT1P9wb2A5Nl6vCzATqM4xCip',
    },
  },
  {
    name: 'test-may-11',
    type: 'local',
    address: 'agoric1p6fp3zj9er8h47r3yndysd9k7ew7es8kjlffus',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'AwuJqq2wUhIY2MlLew4JPbUH97tSBTiTJ+59M5TRLqi5',
    },
  },
  {
    name: 'tg',
    type: 'local',
    address: 'agoric1ly74z376l5fwrr5z26n4pfns7qllraq2nwwfgr',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'AqOKu/JGhihnbWO0e9OipfgNLWg4mUsZyP/LCsGonj+C',
    },
  },
  {
    name: 'user1',
    type: 'local',
    address: 'agoric1xe269y3fhye8nrlduf826wgn499y6wmnv32tw5',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'A4owcrbL34M4lCDua/zhpampsPRJHu5zKp9gc/u8c1YH',
    },
  },
].map(x => x.pubkey.key);
export default testKeys;
