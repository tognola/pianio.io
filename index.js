const fs = require('fs')
const axios = require('axios')

const path_a = "./file_a.csv"
const path_b = "./file_b.csv"

fs.readFile(path_a, 'utf-8', async (err, data) => {
    data = processData(err, data)

    users = await findUsers(data)

    saveResults(users, true)
})

fs.readFile(path_b, 'utf-8', async (err, data) => {
    data = processData(err, data)

    users = await findUsers(data)

    saveResults(users, false)
})


function processData(err, data) {
    rows = data.split('\n');

    headers = rows[0].split(',')

    rows.splice(0, 1)

    let result = rows.map((row, index) => {
        row = row.split(',')
        obj = {}
        row.forEach((col, i) => {
            return obj[headers[i]] = col
        })

        return obj

    })

    return result
}

async function findUsers(data) {
    const url = "https://sandbox.piano.io/api/v3/publisher/user/list?aid=o1sRRZSLlw"
    resp = await axios.get(url, {
        headers: {
            'api_token': 'xeYjNEhmutkgkqCZyhBn6DErVntAKDx30FqFOS6D'
        }
    }
    );
    users = resp.data.users;

    headers = Object.keys(data[0])

    //console.log(headers)

    cols = {};

    headers.forEach( header => {
        header = header == 'user_id' ? 'uid' : header;
        cols[header]  = users.map( user => {
            return  user[header]        
        })

    })


    indexs = [];

    data.forEach(
        row => {
            headers.forEach( header => {
                header = header == 'user_id' ? 'uid' : header;
                let i = cols[header].indexOf(row[header])
                if (i > 0){
                    indexs.push(i)
                }
        
            })
        }
    )

    return users.filter( (user, i) => indexs.includes(i))
    
}

function saveResults(users, header){

    let text = "";

    headers = ["user_id","email","first_name","last_name"]

    if(header){
        text += headers.join(",") + "\n"
    }

    users.forEach( user => {
        text += user.uid + "," + user.email + ","+ user["first_name"]+","+ user["last_name"]+"\n"
    })

    fs.appendFile("./result.csv", text, (err)=> {
        console.log("saved")
    })

}