import { lensPath, view } from '../../src/airdrop/helpers/lenses.js';

const localAccounts = [
  {
    name: 'aug11-1',
    type: 'local',
    address: 'agoric1z2rsy07yx5vlcgqm8gyuvnpe9vk92qlj28e6p4',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'Ax05iH6d+ZMAg1yxl76utK8vFzFNm/zON638Zt+UOBve',
    },
  },
  {
    name: 'aug11-10',
    type: 'local',
    address: 'agoric1l4t567jzlues28dayt72g9nygk8epu0magr4mt',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'A0yuR52cd4BUWLy5sfAhQZ3iSjZcDNwydNBsaxSYTKpw',
    },
  },
  {
    name: 'aug11-11',
    type: 'local',
    address: 'agoric178c8epzre0h585at2m8up6xn39xxl2rxdxd25s',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'Aub/p6AUa8b30r8G6Qtdk8SxIdDkY1jW2C60LiPPprgD',
    },
  },
  {
    name: 'aug11-12',
    type: 'local',
    address: 'agoric1unsewtj2ceth3s335lzujlelu8304wgk4g4dz8',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'Aj5rxb6mzJGatM0NA1++X/57QsZhXoX/34X1FbtJsJm1',
    },
  },
  {
    name: 'aug11-13',
    type: 'local',
    address: 'agoric1jc39ar4rfqrv5mnrak4yxf330h5tkmfqyxwjs7',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'A68QQzcJr1Y5q/9UzzIvRczcT6XXFNoFtKTXZdUJZ6pY',
    },
  },
  {
    name: 'aug11-14',
    type: 'local',
    address: 'agoric1mvewzyspfggj0n3ctxghjm7j0rfq8e8nrealqm',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'AkCtHAEwO+CNI6QlVHjPyoOprHjcDaYacbPaYS6K5DDY',
    },
  },
  {
    name: 'aug11-15',
    type: 'local',
    address: 'agoric17eg08qf2w8el2r6fsqyjl2xylk0h84ca8pfp3a',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'A7LSCacB4dB+s6+LE4rfTZsYwWJpMmupLCEr3y07ZF9F',
    },
  },
  {
    name: 'aug11-16',
    type: 'local',
    address: 'agoric1wdzhndh78zaljzkuyhay48ev6wp0fg7wk48fwn',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'AzjnbeuGqiCRtHfqtvO95dXHb50TY9QHxHic+bR3q3wo',
    },
  },
  {
    name: 'aug11-17',
    type: 'local',
    address: 'agoric125eft98mjx05eamanmqrnfk6ft7xhj06lug0qn',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'A0rRKm4aKtu6A8RHIKypqtG8cTuxx+Rj417NA62XVhRU',
    },
  },
  {
    name: 'aug11-18',
    type: 'local',
    address: 'agoric1u4y0y8s7sj76umy0kvty8mpzu8hjtdnduzqnln',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'AuQmayz6F0h+wvs9kdLNX6zmlo7bzAGfhVFlPQfjGZbA',
    },
  },
  {
    name: 'aug11-19',
    type: 'local',
    address: 'agoric1v5yzk56gpz7sz4awqvq99sfuy7xtlmhepdaw29',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'Amj2Ylp9FaFh0bOkA8HzdFbPPbWqn7dIky92OtLjbUko',
    },
  },
  {
    name: 'aug11-2',
    type: 'local',
    address: 'agoric1uwhlwpunj890hk9sav05a3jf4jju6k4uvsca58',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'Ampg1rWEr7ws3+JTwrtUgmJAXpEacTmAhEoViP2bsSR+',
    },
  },
  {
    name: 'aug11-20',
    type: 'local',
    address: 'agoric1ncqwcrhlqhe0yk2t5jhlvqdg6t0y4rf4ld4veq',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'As9KH9vgHbCkeIcfHhrCO2zIQFtewoJlQMrJ/K40o5EM',
    },
  },
  {
    name: 'aug11-21',
    type: 'local',
    address: 'agoric1k784t4f3326qxp2p7dnjvwyw8jkg0fz7xd7g98',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'AthhWLagU8k+ttNJid/I85vk1WL7dHxOy1LfMumLLTgk',
    },
  },
  {
    name: 'aug11-22',
    type: 'local',
    address: 'agoric1e92eky9u3ydy8hxe5s0fdrypsk07fjwsyp2e0h',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'A0oD2tYHvTuqFcdkX/xU6SDVgBVB1y6GMstDMZblTLgD',
    },
  },
  {
    name: 'aug11-23',
    type: 'local',
    address: 'agoric17kh7ktsmqnse0qr3z9xvtpz9s4wx47w8x8xpdr',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'AiGFrm59gwZDi9w9wZvqn3fluXgtz7Mv6s17cqKM16OF',
    },
  },
  {
    name: 'aug11-24',
    type: 'local',
    address: 'agoric1g74nysglum5h7ye49ajnuxfkrd7ualqpnxm45d',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'AjpUft5zzN2XFsSjhkbKxoaSSutTkPPWSO5wE8sNhXSv',
    },
  },
  {
    name: 'aug11-25',
    type: 'local',
    address: 'agoric18qgsx4m9nfvjqdxwca3kh98avs9xg9gzlf3x4s',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'AlslFnkZ/wlqCLmHnicg8NVRjCtWX3KxkvnxvQdY07cs',
    },
  },
  {
    name: 'aug11-26',
    type: 'local',
    address: 'agoric1945cccwdft5kps9lk5nm262x33p37kdnn0h5yx',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'A7nWtMzRU06GsEwz+D73Ry5gNji8dPiaRJFkcNhfz6Ju',
    },
  },
  {
    name: 'aug11-27',
    type: 'local',
    address: 'agoric10kcfpy0mqeu4kmzdrr2y60j34texm4naqnvcwc',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'A3OhiofCnnx0Bnynf8Dq4KWwXkZMvuGzjupDPAmVrvI2',
    },
  },
  {
    name: 'aug11-28',
    type: 'local',
    address: 'agoric1htst8dj93h6p7ketxhulvvlmxre38mgxz8hr40',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'AxFq4oWXVuiHp34LojKT/lY0Z4dXoVoOvImtJNQtqcb5',
    },
  },
  {
    name: 'aug11-29',
    type: 'local',
    address: 'agoric1x6yvkvv40emdvlva2z4y325nsrx0mrjq6yt0gn',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'Aw9Vykd2tBLvI4DOeP/CSQ7Gmbw2uBQRaeU+PdRx0xEZ',
    },
  },
  {
    name: 'aug11-3',
    type: 'local',
    address: 'agoric1xs2w37j6kkh6kap28nw2a3850qvngcmg7676fg',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'AuNOTHmg1W6xQtwfkcTEKBpzvpYWEjit6TXju+ZjyqfG',
    },
  },
  {
    name: 'aug11-4',
    type: 'local',
    address: 'agoric1mw8vqrducp4j6ten4fay68sx7te53u76p0gpqw',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'A8BIM3Rg/gx5E3avFTKqw60mQGQ2LEC5sR/mVU4IGi4z',
    },
  },
  {
    name: 'aug11-5',
    type: 'local',
    address: 'agoric1vfqs2c3qsrp92vfem74yuvkfutgx2qa2ljyfnu',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'AlbZtV99bjUOUUuU56zYMd0vA+7zfGaXt/xvxjuMuCYx',
    },
  },
  {
    name: 'aug11-6',
    type: 'local',
    address: 'agoric1vx9d5qe4fu0xs2ytm6kvmew8g5g7r98eqhu2vp',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'A5J2VTrnUyieiXC2A5GDR+Z1ftb8F4fpwU/my3aJaVhU',
    },
  },
  {
    name: 'aug11-7',
    type: 'local',
    address: 'agoric1r6d56qcc0n3l7e32ql63vm448kxqf72pykqelr',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'AwEuMlMqZ86LX/NK4p6qkHxObPu5qyVQmnSP0rkUMEF9',
    },
  },
  {
    name: 'aug11-8',
    type: 'local',
    address: 'agoric1lwpun90lq6m532muqjr9k2s8rcg0xumulvxee3',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'AuJKmjFQSl+PkPKMJ6pC8/1FdjFNkUcUWpUak08bCN7T',
    },
  },
  {
    name: 'aug11-9',
    type: 'local',
    address: 'agoric1uek5egmqdhpdj88729xhuc93z3xtgxvg6jfw2s',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'A7z9OyaLL+NH3OnKMWDdInL4X/R9UhptbrbXmpQejAqW',
    },
  },
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
    name: 'new-wallet',
    type: 'local',
    address: 'agoric1pgu2762h57gu26pkqvk2n69t20jp49tr9g9j9c',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'AmW8bl/nAe0x3OV7Q63iinhhXLOpbK1Swws54DzcGRbM',
    },
  },
  {
    name: 'nicole-ed5519',
    type: 'local',
    address: 'agoric1asqyu0h3eeh8zk75qnneqvtm04qp5fam6ky8mt',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'Ax3uzLIa7W/wsVFrJVqjbSw9l82vEqxUKfcxpjIbqvxV',
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
    name: 'test-wallet',
    type: 'local',
    address: 'agoric1anteyf2jvdp0ljp06y9z6zhlfgj4jpdzyxn8nk',
    pubkey: {
      type: '/cosmos.crypto.secp256k1.PubKey',
      key: 'A527w3+pnESEmO04ZODSbCKI9LMfmvkGU1FMjEHNp3Ie',
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
];

const pubkeyLens = lensPath(['pubkey', 'key']);

const getPubkeyFromAccount = view(pubkeyLens);
const agdTestKeys = localAccounts.map(getPubkeyFromAccount); // ?

export { agdTestKeys };
