# Real-Time Animation Editor with Collaboration

This repository represent Vitalii Sukhostavskyi's assessment task and gives users capabilities of real-time animation editor tool with collaboration.

## Demo:

[YouTube Demo link](https://www.youtube.com/watch?v=-d62DnsplO0) (better quality)

https://github.com/suhostv/real-time-animation-editor-with-collaboration/assets/16260497/b9a95569-7d16-473a-9ad9-ab577e926da4

## How to run locally:

Prerequisite: you need to have Node v18 installed on your machine.

This repository has both client and server applications, so we will need to start both:
1. From root application folder run server app:
```
cd server
npm install
npm start
```

2. From root application folder run client app:
```
npm install
npm run dev
```

3. Open website in browser using link in terminal window.

## App capabilities:

1. Open and edit animations from local JSON files.
2. Open and edit animations from LottieFiles featured animations section.
3. View all animation layers in hierarchy structure.
4. Expand layers under another layer structure
5. View layer details upon layer click
6. Edit layer color (if applicable, not every layer have color settings)
7. Delete layer
8. Real-time collaborative experience
9. Online status if somebody else is editing the same animation (for featured animations only)
10. Save editing progress when at least one client has edit animation page opened
11. Error handling when choosing incorrect file type during file selection

## App opportunities:

!!! IMPORTANT NOTE !!!
All thing mentioned in this section were not implemented due to tight deadlines for this task and difficulties working with Lottie GraphQL API.

1. Editing of wider variety of layer properties (color is available for now)
2. Ability to edit wider variety of layer color configs (for now only plain layer colors can be changed, not ones with keyframes)
3. Ability to filter out LottieFiles featured  animations (by default only first 20 available for now)
4. Usage of appropriate database on server-side (for now data is saved locally on server)

## Contact me:

If you have any questions or problems running application locally, just send me an email, I'll be glad to help: suhost.v@gmail.com
