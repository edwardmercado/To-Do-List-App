const express = require("express");
const bodyParser = require("body-parser");
const { urlencoded } = require("body-parser");
const mongoose = require("mongoose");

const app = new express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.set("view engine", "ejs");

// const todoItems = ["Study Programming", "Make an application"];
// const workItems = [];
mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser: true});

//the schema
const itemSchema = {
    name: String
};

//the model
const Item = mongoose.model("Item", itemSchema);

const item1 = new Item ({
    name: "Welcome to your to do list"
});

const item2 = new Item ({
    name: "Hit the + button to add a new item"
});

const item3 = new Item ({
    name: "<-- Hit this to delete an item"
});

const defaultItems = [item1, item2, item3];

//saving the items using insertMany
// Item.insertMany(defaultItems, function(err){
//     if (err){
//         console.log(err)
//     } else {
//         console.log("Successfully added default items to DB");
//     }
// });

// new schema
const listSchema = {
    name: String,
    items: [itemSchema]
};

//new collection in plural form = Lists
const List = mongoose.model("List", listSchema);


app.get("/", function (req, res) {



    Item.find({}, function(err, results){

        if (err) {
            console.log(err);
        }

        if (results.length === 0){
            //saving the items using insertMany
            Item.insertMany(defaultItems, function(err){
                if (err){
                    console.log(err)
                } else {
                    console.log("Successfully added default items to DB");
                }
            });
            res.redirect("/");

        } else {
            console.log(results);
            res.render("list", { listTitle: "Today", newTodo: results });
        }

    });

});


app.post("/", function(req, res){

    const newTodo = req.body.newTodo;

    // if (req.body.list === "Work"){

    //     workItems.push(newTodo);
    //     res.redirect("/work");

    // } else {

    //     todoItems.push(newTodo);
    //     res.redirect("/");

    // }

    const newItem = new Item ({
        name: newTodo
    });

    newItem.save();

    res.redirect("/");

});

app.post("/delete", function(req, res){
    console.log(req.body.checkbox);

    Item.findByIdAndRemove( { _id: req.body.checkbox }, function(err){
        if (err){
            console.log(err);
        } else {
            console.log("Successfully deleted checked item");
            res.redirect("/");
        }
    });

});

// app.get("/work", function(req, res){

//     res.render("list", { listTitle: "Work List", newTodo: workItems });

// });

app.get("/:customListName", function(req, res){
    const customListName = req.params.customListName;

    

    List.findOne({ name: customListName }, function(err, results){
        if (err) {
            console.log(err)
        }

        if (!results){
            //create a new list
            //define new item
            const list = new List({
                name: customListName,
                items: defaultItems
            });

            //save the item
            list.save();

            res.redirect("/" + customListName);
            
        } else {
            //Show an existing list
            res.render("list", {listTitle: results.name, newTodo: results.items});
        }
    })

    

});

app.post("/work", function(res, req){

    let newWorkTodo = req.body.newTodo;

    workItems.push(newWorkTodo);

    res.redirect("/work");

});

app.get("/about", function(req, res){
    res.render("about");
})

app.listen(5000, function () {
  console.log("Server is running on port 5000");
});
