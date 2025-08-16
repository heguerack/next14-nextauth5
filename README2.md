## More notes

### Security Issue

- when gettign ahead of the game trying to do my own logic for resetting the passsword,I got ti working , but then realized how weak y set up was. I ma letting the users change the passwrod with the link or redirect from email.
- `http://localhost:3000/auth/new-password?email=heguer76%40gmail.com` here is a clear example. so all someone needs to know is the email address and how the app works to be able to change someone elses password!!
- Need to think of the solution for now. or go back to the course desing.

- we ahve to verify the email if with credetials, but if we change the email, then we dont have to verify the new email? homework, do the logic, do all the changes but dont do for email, instead, send email verification for the new email, once then update :)

- improvement madem , better notifications at amid,beter ui for role in settings
- added schema refine for name min 2 characters if cahnged in settings
- homework: Make sure to change the way it loads in settigafter sign in...it seems we are grabin gthat from the session, but the session needs a reload, so it kind of sucks.
