# [dougwebb.site](https://www.dougwebb.site/)

## Purpose
1. To provide a 'platform-independent', personal portal through which I can share:
  1. my works, including but not limited to:
    1. slides,
    1. articles,
    1. posts,
    1. event invitations.
  1. my rationale for the work I do,
  1. connection details,
  1. how I can support people/vice-versa.
1. To learn and enjoy what's possible with modern web-design.

## Design desires 
- mobile first
  - all other devices a close second
  - as in, check development with a phone. When happy, look at a larger screen.
- simple
  - 'less is more'
  - 'it's perfect when nothing more can be taken away'
- accessible
  - add alt-text to images
  - don't otherwise mess up screen-readers
  - big/clear enough navigation
  - allow phone-users to navigate without strain injuries
  - don't use prohibitive technologies (i.e. >90% web user browser support.)
- no jumping
  - all content loaded in index.html, pages shown with checkbox hack/radio-buttons
  - placeholders for loading images
  - measures for desktop scrollbar width
  - consistent element placement
  - pre-fetching/loading/rendering if necessary

## Local-serving for developing
install node http-server

```
$
npm install -g http-server
```

serve without caching

```
$
cd /path/to/baseDirectory
http-server -c-1 -p 8080
```

## Nice CSS layout debugging
Using Dev Tools console

```
>>
$$('*').map((A,B)=>A.style.outline=`1px solid hsl(${B*B},99%,50%`)
```

## Web-design resources
- html validator: https://validator.w3.org
- on spacing: https://hackernoon.com/margin-or-padding-f5252562313
- web accessibility in mind: https://webaim.org/intro/
- nice use of gradients in buttons: http://cssdeck.com/labs/push-the-buttons
- on avoiding broken links: https://4042302.org
- a complex selector: https://hackernoon.com/margin-or-padding-f5252562313
- amazing flex-box interactive: https://yoksel.github.io/flex-cheatsheet/
- normalize css: https://necolas.github.io/normalize.css/
- on css writing styles, BEM+ http://getbem.com/introduction/
- Performance freaking: https://varvy.com/pagespeed/wicked-fast.html

## Inspiring websites
- Aral Balkan's website: https://ar.al/
- Zaarly's handbook: http://handbook.zaarly.com/#introduction
- Edward Platt's website: https://elplatt.com/
- Toon Claes's website: https://iotcl.com/
- Matt Boldt's website: https://mattboldt.com
- Max's website: https://maxlath.eu/
- Wolfi's website: https://wolfi.space/
- Chandi's website: https://chandi.it/
- John Otander's site: http://johnotander.com/writing/
- Liz Denys's website: https://lizdenys.com
- William Casarin's website: https://jb55.com/
- Joey Hess's Website: http://joeyh.name/
- Grant Ford's website: https://poetgrant.press/
- Douglas Blank's site: https://cs.brynmawr.edu/~dblank/
