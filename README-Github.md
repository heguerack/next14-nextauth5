# GITHUB BRANCHIN AND SAVING

- copy this from git hub when creating new project
- It will creat the initial commit
- it will push initial project

```ts
git remote add origin https://github.com/heguerack/brad-store.git
git branch -M main
git push -u origin main
```

- this will add a new commit
- and will push to main once again

```ts
git branch
git checkout main
git add .
git commit -m "Added search techs feature"
git push -u origin main
```

- Lets branch out
- dont forget to branch out
- -donbt forget to puch to the new branch

```ts
git checkout -b added-search-techs-feature
git push -u origin added-search-techs-feature
```

- Now swith to main and pull from github

```ts
git checkout main
git pull origin main // this is optional, just if someone else is working on it
```

## Github branches lecture

```ts
Golden Rule: Never push to main directly in a team
✅ Recommended Workflow (Safe & Professional):
Work in branches (branch-1, branch-2, etc.)

When done, push to GitHub (but still on your branch)

Open a Pull Request (PR) into main

Someone (or you) reviews and merges

After merging, everyone pulls the new main

📦 Example Team Flow (You + One Teammate):
👤 You:
Work in branch-2

Push to GitHub

Open PR into main

👤 Teammate:
Work in branch-1

Also opens PR into main

Then:
Merge one of the branches first (say, branch-1)

Before merging branch-2, you pull from main into branch-2 to resolve conflicts

bash
Copy
Edit
git checkout branch-2
git pull origin main      # sync up before merging into main
Then finalize PR for branch-2

✅ Benefits:
No one breaks main

Easy to spot bugs or conflicts early

Clean, trackable history

Let me know if you want a visual diagram of this (PR flow), or I can give you a GitHub repo setup guide with branch protection rules.
```
