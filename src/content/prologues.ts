/**
 * Story of the game: one prologue per chapter, shown the first time the player enters it.
 *
 * The player works their first night shift at Loopback, a fictional company that runs
 * the API of an online shop. Noa, the on-call lead, assigns the tickets. Order 903 runs
 * through the night and closes in the final mission, and the previous night shift, who
 * never logged out, is the way into the secrets of the Sandbox. The story does not change
 * the missions: to rewrite a chapter, edit its entry here.
 */

import type { ChapterId, LocalizedText } from '../core/missions'
import { t } from './helpers'

/** Introduction to one chapter. */
export interface Prologue {
  /** Time and place, shown above the title. */
  signal: LocalizedText
  title: LocalizedText
  paragraphs: { en: string[]; es: string[] }
  /** What Noa says before the player starts. */
  quote: LocalizedText
  /** Label of the button that closes the prologue. */
  action: LocalizedText
}

/** Name of the on-call lead, the same in both languages. */
export const PROLOGUE_SPEAKER = 'NOA'

/** One prologue per chapter. `Record` makes the compiler require it for any new chapter. */
export const prologues: Record<ChapterId, Prologue> = {
  1: {
    signal: t('LOOPBACK · 22:00 · SERVER ROOM', 'LOOPBACK · 22:00 · SALA DE SERVIDORES'),
    title: t('First night', 'Primera noche'),
    paragraphs: {
      en: [
        'Your badge still smells of plastic. Loopback runs the API behind an online shop, and tonight the night shift is you, a row of humming racks and a coffee machine with opinions.',
        'Noa, the on-call lead, shows you a desk and sends you the first ticket before you have sat down. Nobody here expects you to know how an API works. They expect you to know by morning.',
      ],
      es: [
        'Tu acreditación todavía huele a plástico. Loopback gestiona la API de una tienda online, y el turno de noche de hoy sois tú, una fila de racks que zumban y una cafetera con opiniones propias.',
        'Noa, responsable de guardia, te señala una mesa y te envía el primer ticket antes de que te sientes. Aquí nadie espera que sepas cómo funciona una API. Esperan que lo sepas por la mañana.',
      ],
    },
    quote: t(
      '“An API is a waiter: it takes your order to the kitchen and comes back with the answer. So tonight, order clearly.”',
      '“Una API es un camarero: lleva tu pedido a la cocina y vuelve con la respuesta. Así que esta noche, pide con claridad.”',
    ),
    action: t('Take the first ticket', 'Coger el primer ticket'),
  },
  2: {
    signal: t('LOOPBACK · 23:30 · YOUR DESK', 'LOOPBACK · 23:30 · TU MESA'),
    title: t('Permission to touch things', 'Permiso para tocar cosas'),
    paragraphs: {
      en: [
        'You have spent the last hour and a half reading data, and nothing has caught fire. Noa takes that as a good sign and gives you write access, which you take as a bad one.',
        'Reading is only one of the things a request can ask for. From now on your tickets create, change and delete real records, and the method you choose decides which of those happens.',
      ],
      es: [
        'Llevas hora y media leyendo datos y nada ha salido ardiendo. Noa se lo toma como una buena señal y te da permisos de escritura, cosa que tú te tomas como una mala.',
        'Leer es solo una de las cosas que puede pedir una petición. A partir de ahora tus tickets crean, cambian y borran registros reales, y el método que elijas decide cuál de esas cosas ocurre.',
      ],
    },
    quote: t(
      '“GET asks. The others change things. Know which one you are holding before you press send.”',
      '“GET pregunta. Los demás cambian cosas. Ten claro cuál llevas en la mano antes de pulsar enviar.”',
    ),
    action: t('Open the tickets', 'Abrir los tickets'),
  },
  3: {
    signal: t('LOOPBACK · 01:00 · ALERT PANEL', 'LOOPBACK · 01:00 · PANEL DE ALERTAS'),
    title: t('The API talks back', 'La API contesta'),
    paragraphs: {
      en: [
        'The first alert of the night turns a light amber, and then a second one joins it. Support wants to know whether the shop is down. Noa does not look up from the screen.',
        'Every response starts with a number, and that number already says who has to act: you, the client or the server. Learn to read it, and most incidents explain themselves.',
      ],
      es: [
        'La primera alerta de la noche enciende una luz ámbar, y enseguida se le suma otra. Soporte quiere saber si la tienda se ha caído. Noa no levanta la vista de la pantalla.',
        'Toda respuesta empieza por un número, y ese número ya dice a quién le toca actuar: a ti, al cliente o al servidor. Aprende a leerlo y la mayoría de los incidentes se explican solos.',
      ],
    },
    quote: t(
      '“Do not panic at a red number. It is the most honest thing you will hear tonight.”',
      '“No te asustes con un número en rojo. Es lo más sincero que vas a oír esta noche.”',
    ),
    action: t('Read the alerts', 'Leer las alertas'),
  },
  4: {
    signal: t('LOOPBACK · 02:15 · VENDING MACHINE', 'LOOPBACK · 02:15 · MÁQUINA DE VENDING'),
    title: t('A missing comma', 'Una coma de menos'),
    paragraphs: {
      en: [
        'A partner has spent all night sending the shop broken requests, and the ticket they opened is written in capital letters. The problem turns out to be a single comma, which is how these things usually go.',
        'The API does not guess what you meant. Types, quotes and required fields are the whole conversation, so from here on you will write the JSON yourself, and you will repair other people’s too.',
      ],
      es: [
        'Un socio lleva toda la noche enviando peticiones rotas a la tienda, y el ticket que ha abierto está escrito en mayúsculas. El problema resulta ser una sola coma, que es como suelen ir estas cosas.',
        'La API no adivina lo que querías decir. Los tipos, las comillas y los campos obligatorios son toda la conversación, así que a partir de aquí escribirás tú el JSON y arreglarás también el de los demás.',
      ],
    },
    quote: t(
      '“The server is not being difficult. It is being exact. Be exact back.”',
      '“El servidor no se pone difícil. Es exacto. Sé exacto tú también.”',
    ),
    action: t('Fix the payloads', 'Arreglar los envíos'),
  },
  5: {
    signal: t('LOOPBACK · 03:30 · SUPPORT QUEUE', 'LOOPBACK · 03:30 · COLA DE SOPORTE'),
    title: t('Order 903', 'El pedido 903'),
    paragraphs: {
      en: [
        'A customer called Ana Torres has written to support three times about order 903, which has been pending for days. Finding it means searching thousands of records, and support would like that done before she writes a fourth time.',
        'Nobody asks for a whole collection when they only want a piece of it. Query parameters filter, sort and split a response, and they are the difference between an answer and a wall of data.',
      ],
      es: [
        'Una clienta llamada Ana Torres ha escrito tres veces a soporte por el pedido 903, que lleva días pendiente. Encontrarlo supone buscar entre miles de registros, y soporte querría tenerlo antes de que escriba una cuarta vez.',
        'Nadie pide una colección entera cuando solo quiere una parte. Los parámetros query filtran, ordenan y reparten una respuesta, y son la diferencia entre una respuesta y un muro de datos.',
      ],
    },
    quote: t(
      '“Keep an eye on that order. Something about it feels wrong, and I would rather you found out than a customer.”',
      '“No le quites ojo a ese pedido. Hay algo que no me encaja, y prefiero que lo descubras tú a que lo haga un cliente.”',
    ),
    action: t('Search the records', 'Buscar en los registros'),
  },
  6: {
    signal: t('LOOPBACK · 04:45 · LOCKED CORRIDOR', 'LOOPBACK · 04:45 · PASILLO CERRADO'),
    title: t('Not everyone gets in', 'No entra cualquiera'),
    paragraphs: {
      en: [
        'The answer on order 903 is behind a door you cannot open. The private endpoints want to know who you are, and then whether you are allowed, and those turn out to be two different questions.',
        'Noa gives you a training account and then, after a long look, an admin token. In the logs there is an old session from the previous night shift. It never logged out, and nobody seems to want to talk about it.',
      ],
      es: [
        'La respuesta sobre el pedido 903 está tras una puerta que no puedes abrir. Los endpoints privados quieren saber quién eres y, después, si tienes permiso, y resulta que son dos preguntas distintas.',
        'Noa te da una cuenta de entrenamiento y, tras mirarte un buen rato, un token de administrador. En los registros aparece una sesión antigua del turno de noche anterior. Nunca se cerró, y nadie parece querer hablar de ello.',
      ],
    },
    quote: t(
      '“401 means I do not know you. 403 means I know you, and the answer is no. Do not lose that token.”',
      '“401 significa que no te conozco. 403 significa que te conozco y la respuesta es no. No pierdas ese token.”',
    ),
    action: t('Sign in', 'Iniciar sesión'),
  },
  7: {
    signal: t('LOOPBACK · 05:40 · ALONE', 'LOOPBACK · 05:40 · SIN NADIE'),
    title: t('You are the night shift', 'El turno de noche eres tú'),
    paragraphs: {
      en: [
        'Noa has gone to deal with something on another floor and has left you a note on the keyboard. Every ticket left in the queue is broken in a different way, and each one combines everything you have seen tonight.',
        'Nobody will tell you which part of the request is wrong any more. Read the response, form a theory and test it. At the end of the queue, as you suspected, order 903 is waiting.',
      ],
      es: [
        'Noa se ha ido a resolver algo a otra planta y te ha dejado una nota sobre el teclado. Cada ticket que queda en la cola está roto de una forma distinta, y cada uno combina todo lo que has visto esta noche.',
        'Ya nadie te va a decir qué parte de la petición falla. Lee la respuesta, plantea una teoría y compruébala. Al final de la cola, como sospechabas, te espera el pedido 903.',
      ],
    },
    quote: t(
      '“You do not need me for this one. Close 903 before the morning shift arrives.”',
      '“Para esto ya no me necesitas. Cierra el 903 antes de que llegue el turno de mañana.”',
    ),
    action: t('Start the last queue', 'Empezar la última cola'),
  },
}
