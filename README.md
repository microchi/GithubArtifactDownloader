# Listen on http post to launch download the action artifact in your github Repository.
---

How To Use
---

## Warnning!!! 

    All file in ThePathYouWantToDownload WILL BE ERASED before Download!

1.Launch By Http Post

    docker run --name <YourName> -d -p 3000:3000 -v <ThePathYouWantToDownload>:/root/dist -e GAD_Owner=<Owner> -e GAD_Repo=<Repository> -e GAD_Token=<Token> -e GAD_Delay=<Seconds> microchi/github_artifact_downloader:latest
    
    then
    
    curl -X POST -H "authorization: token <Token>" http://localhost:3000
    
2.Run Once

    docker run --rm -v <ThePathYouWantToDownload>:/root/dist -e GAD_Owner=<Owner> -e GAD_Repo=<Repository> -e GAD_Token=<Token> -e GAD_Runonce=true microchi/github_artifact_downloader:latest

Environment Variables
---
1.GAD_Owner=YourOwner

     Owner, EX: https://github.com/nodejs/node Owner is nodejs

2.GAD_Repo=YourRepository

    Repository, EX: https://github.com/nodejs/node Repository is node'

3.GAD_Token=YourToken

    Personal Access Tokens See https://github.com/settings/tokens'

4.GAD_Runonce=false

    Run Once. Default is false)

4.GAD_Delay=5

    Seconds Delay To Launch Download. Default is 5)