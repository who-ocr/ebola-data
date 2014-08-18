## WHO-OCR Ebola Portal

Data site for the World Health Organization Outbreak and Crisis Response (OCR). 

#### Requirements

Install dependencies: `npm install && bower install`

Test Server: `grunt server`

Build: `grunt build`

#### Workflow
`master` branch will contain production files. `gh-pages` will mirror the `dist/` folder. Branch from `master` to do development. Pull request into `master`. Then build and push new `/dist` folder to `master` before pushing to `gh-pages`.

1. Work in `app/` folder.

2. If new file created, ensure it is captured in `grunt.js`

3. To run locally, run `grunt server`. Site will run on `localhost:9000`.

4. To build the site, run `grunt build`. This will update the `dist/` folder. Ensure that grunt.js has copied all site files.

5. Push changes to branch: both `app/` and `dist/`.

6. Run `git subtree push --prefix dist origin gh-pages` to push `dist/` files to `gh-pages` branch.
