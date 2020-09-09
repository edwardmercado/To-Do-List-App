const express = require("express");
const bodyParser = require("body-parser");
const { urlencoded } = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = new express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.set("view engine", "ejs");

// const todoItems = ["Study Programming", "Make an application"];
// const workItems = [];

const mongoAtlasURI = "mongodb+srv://admin-edward:Test123@cluster0.akcze.mongodb.net/todolistDB?retryWrites=true&w=majority";

mongoose.connect(mongoAtlasURI, {useNewUrlParser: true});

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
    const listName = req.body.list;
    

    const newItem = new Item ({
        name: newTodo
    });

    if (listName === "Today"){
        newItem.save();
        res.redirect("/");
    } else {
        List.findOne({ name: listName }, function(err, results){
            results.items.push(newItem);
            results.save();
            res.redirect("/" + listName);
        });
    }

    

});

app.post("/delete", function(req, res){

    const checkedItemId = req.body.checkbox;
    const listNameHidden = req.body.hiddenList;

    if (listNameHidden === "Today"){
        Item.findByIdAndRemove( { _id: checkedItemId }, function(err){
            if (err){
                console.log(err);
            } else {
                console.log("Successfully deleted checked item");
                res.redirect("/");
            }
        });
    } else {
        List.findOneAndUpdate(
            { name: listNameHidden }, 
            { $pull: {items: { _id: checkedItemId }} },
            function(err, results) {
            
                if (err){
                    console.log(err);
                } else {
                    res.redirect("/" + listNameHidden);
                }

            }
        );
    }


    

});

app.get("/:customListName", function(req, res){
    const customListName = _.capitalize(req.params.customListName);

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
    });

});

app.post("/work", function(res, req){

    let newWorkTodo = req.body.newTodo;

    workItems.push(newWorkTodo);

    res.redirect("/work");

});

app.get("/about", function(req, res){
    res.render("about");
})

let port = process.env.PORT; //port that Heroku use
if (port == null || port == "") {
  port = 5000;
}

app.listen(port, function () {
  console.log("Server has started successfully");
});
