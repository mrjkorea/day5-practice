#!/usr/bin/env python3
"""Generate Intermediate Day 5 question packs (shell content until staging packs land)."""
import json
import os
import random

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

BOOKS = {
    "int2a": {
        "label": "Intermediate 2A",
        "units": [
            "Weather in Different Regions",
            "There Is / There Are",
            "Country Languages",
            "What Do You Want?",
            "Finding Object Locations",
            "Agreeing and Responding",
            "Location and Place",
            "After-School Activities",
        ],
    },
    "int2b": {
        "label": "Intermediate 2B",
        "units": [
            "Store Hours and Days",
            "Time and Daily Activities",
            "Future Dreams",
            "Prices and Money",
            "Describing People and Things",
            "Introducing Teachers",
            "Where Things Are",
            "Mine and Yours",
        ],
    },
    "int2c": {
        "label": "Intermediate 2C",
        "units": [
            "Favorite Seasons",
            "What Are You Doing?",
            "Whose Is It?",
            "Likes and Preferences",
            "Feelings and Emotions",
            "Body and Health",
            "Phone Conversations",
            "Saying Goodbye",
        ],
    },
    "int3a": {
        "label": "Intermediate 3A",
        "units": [
            "Draw and Art",
            "Asking Opinions",
            "Adjectives and Opposites",
            "Age Questions",
            "Insects and Bugs",
            "Greetings",
            "Exercise and Sports",
            "Self Introduction",
        ],
    },
    "int3b": {
        "label": "Intermediate 3B",
        "units": [
            "School Grades",
            "True or False",
            "Comparative Adjectives",
            "Who Is That?",
            "Commands and Requests",
            "Fruits",
            "Don't Forget",
            "Meeting Foreigners",
        ],
    },
    "int3c": {
        "label": "Intermediate 3C",
        "units": [
            "Food and Recommendations",
            "Don't Do That",
            "Asking Permission",
            "Invitations",
            "Have and Possessions",
            "Introducing Korea",
            "Can Questions",
            "Telling Time",
        ],
    },
}

# Per-unit vocabulary banks: (prompt, correct, distractors)
UNIT_BANKS = {
    "int2a": [
        [
            ("How is the weather in Seoul?", "It's sunny and warm.", ["It's snowing hard.", "I like pizza.", "She is twelve."]),
            ("What's the weather like in London?", "It's rainy and cloudy.", ["I have a red bag.", "He plays soccer.", "Open the window."]),
            ("Is it hot in Dubai?", "Yes, it's very hot.", ["No, I am tired.", "She draws pictures.", "They are at school."]),
            ("How's the weather today?", "It's windy and cool.", ["I want some juice.", "He is my brother.", "We study English."]),
            ("What's the temperature in winter?", "It's below zero.", ["I go home at four.", "She likes music.", "They have two cats."]),
        ],
        [
            ("Choose the correct sentence.", "There is a book on the desk.", ["There are a book on the desk.", "There is books on the desk.", "There have a book."]),
            ("What can you say?", "There are three chairs in the room.", ["There is three chairs.", "There are chair in the room.", "There is many chairs."]),
            ("Pick the right answer.", "There isn't any milk.", ["There isn't some milk.", "There aren't any milk.", "There not is milk."]),
            ("Complete the idea.", "There are many students here.", ["There is many students.", "There are a student.", "There have students."]),
            ("Which is correct?", "There is a park near my house.", ["There are a park.", "There is parks.", "There have park."]),
        ],
        [
            ("People in France speak ___.", "French", ["France", "Franc", "Franch"]),
            ("The language of Japan is ___.", "Japanese", ["Japan", "Japaneese", "Japans"]),
            ("In Korea, people speak ___.", "Korean", ["Korea", "Koreans", "Koreish"]),
            ("People in Spain speak ___.", "Spanish", ["Spain", "Spaneesh", "Spains"]),
            ("The language of China is ___.", "Chinese", ["China", "Chineese", "Chinas"]),
        ],
        [
            ("What do you want for lunch?", "I want a sandwich.", ["I am twelve years old.", "It is raining.", "She is my teacher."]),
            ("What would you like to drink?", "I'd like some water, please.", ["I go to school.", "He is tall.", "They are happy."]),
            ("What do you want to do?", "I want to play outside.", ["I have two brothers.", "It is Monday.", "She likes red."]),
            ("May I help you?", "I want a chocolate muffin.", ["I am fine.", "Yes, I can swim.", "He is at home."]),
            ("What do you want for dessert?", "I want ice cream.", ["I live in Busan.", "We study math.", "She runs fast."]),
        ],
        [
            ("Where is my pencil?", "It's in your bag.", ["I like apples.", "She is kind.", "We play games."]),
            ("Where are the keys?", "They are on the table.", ["He is ten.", "I want juice.", "It is cold."]),
            ("Can you find the eraser?", "It's under the chair.", ["I am hungry.", "They sing songs.", "She reads books."]),
            ("Where is the library?", "It's next to the cafeteria.", ["I have a dog.", "He plays piano.", "We eat lunch."]),
            ("Where are my shoes?", "They are by the door.", ["I like summer.", "She is my friend.", "He runs every day."]),
        ],
        [
            ("I love this song!", "Me too!", ["I don't know.", "Goodbye.", "How old are you?"]),
            ("That movie was amazing!", "I agree!", ["I am twelve.", "Where is it?", "Open your book."]),
            ("I'm so tired today.", "Me neither... wait, I mean, I feel the same.", ["I want pizza.", "She is tall.", "It's Tuesday."]),
            ("This homework is hard.", "You're right.", ["I have a cat.", "He sings well.", "Let's eat."]),
            ("I think we should rest.", "Good idea!", ["I am from Korea.", "She likes blue.", "He is my dad."]),
        ],
        [
            ("Where is the post office?", "It's on Main Street.", ["I like music.", "She is happy.", "We have class."]),
            ("Is the bank far from here?", "No, it's quite close.", ["I want water.", "He is young.", "They play soccer."]),
            ("Where can I buy stamps?", "At the post office.", ["I am fine.", "She reads fast.", "He has a bike."]),
            ("Where is the nearest subway?", "It's two blocks away.", ["I like dogs.", "We study English.", "She is kind."]),
            ("Where is your classroom?", "It's on the third floor.", ["I eat lunch.", "He plays games.", "They are friends."]),
        ],
        [
            ("What do you do after school?", "I go to piano lessons.", ["I am eleven.", "It is sunny.", "She is tall."]),
            ("What does Jay do after school?", "He plays soccer with friends.", ["I like red.", "We eat rice.", "She has a cat."]),
            ("Do you have clubs after school?", "Yes, I join the art club.", ["I am hungry.", "He is my brother.", "It is cold."]),
            ("What do you usually do at 4 p.m.?", "I do my homework.", ["I like summer.", "She sings well.", "He runs fast."]),
            ("What are you doing after class?", "I'm meeting my friends.", ["I have two pens.", "She is kind.", "He likes math."]),
        ],
    ],
    "int2b": [
        [
            ("When is the store open?", "It's open from Monday to Friday.", ["I like apples.", "She is ten.", "He plays soccer."]),
            ("What day is it today?", "It's Wednesday.", ["I am fine.", "She has a dog.", "They swim."]),
            ("Is the shop open on Sunday?", "No, it's closed on Sunday.", ["I want juice.", "He is tall.", "We study."]),
            ("Which days is the library open?", "Tuesday through Saturday.", ["I like blue.", "She reads.", "He runs."]),
            ("When does school start?", "It starts on Monday.", ["I have a cat.", "She sings.", "He eats."]),
        ],
        [
            ("What time is it?", "It's half past three.", ["I like pizza.", "She is kind.", "He has a bike."]),
            ("What do people do in the morning?", "They eat breakfast.", ["I am twelve.", "She likes red.", "He plays."]),
            ("What time do you go to bed?", "I go to bed at ten.", ["I like summer.", "She runs.", "He sings."]),
            ("What do you do at noon?", "I eat lunch.", ["I have a dog.", "She is tall.", "He reads."]),
            ("When do you do homework?", "I do homework in the evening.", ["I like music.", "She swims.", "He jumps."]),
        ],
        [
            ("What do you want to be?", "I want to be a doctor.", ["I am hungry.", "It is cold.", "She is my friend."]),
            ("What is her dream job?", "She wants to be a teacher.", ["I like cats.", "He runs.", "We eat."]),
            ("What does he hope to become?", "He hopes to be an engineer.", ["I have a pen.", "She sings.", "He sleeps."]),
            ("What is your future dream?", "I dream of being a scientist.", ["I like blue.", "She reads.", "He plays."]),
            ("What does she want to do someday?", "She wants to travel the world.", ["I am fine.", "He is tall.", "We study."]),
        ],
        [
            ("How much is this shirt?", "It's twenty dollars.", ["I like rice.", "She is kind.", "He plays."]),
            ("What's the price of the bag?", "It's fifteen thousand won.", ["I have a cat.", "She runs.", "He sings."]),
            ("Is the notebook expensive?", "No, it's quite cheap.", ["I am ten.", "She likes red.", "He reads."]),
            ("How much are these shoes?", "They're fifty dollars.", ["I like summer.", "She swims.", "He eats."]),
            ("What does the pen cost?", "It costs two dollars.", ["I have homework.", "She is tall.", "He jumps."]),
        ],
        [
            ("Who is the tall boy with glasses?", "That's my cousin Minho.", ["I like pizza.", "It is Monday.", "She has a dog."]),
            ("Which girl is wearing a red hat?", "The one near the window.", ["I am fine.", "He plays.", "We eat."]),
            ("Describe the man at the door.", "He's wearing a blue jacket.", ["I like cats.", "She sings.", "He runs."]),
            ("Who has the curly hair?", "That's Sora.", ["I have a pen.", "She reads.", "He sleeps."]),
            ("Which student is very quiet?", "The boy in the back row.", ["I like music.", "She swims.", "He jumps."]),
        ],
        [
            ("Mom, this is my English teacher.", "Nice to meet you.", ["I am hungry.", "It is cold.", "She likes red."]),
            ("Let me introduce Mr. Kim.", "Pleased to meet you.", ["I have a cat.", "He runs.", "We study."]),
            ("These are my teachers.", "Hello, everyone!", ["I like blue.", "She sings.", "He plays."]),
            ("Dad, meet my science teacher.", "How do you do?", ["I am ten.", "She reads.", "He eats."]),
            ("This is Ms. Park, my homeroom teacher.", "Welcome to our home.", ["I like summer.", "She swims.", "He jumps."]),
        ],
        [
            ("Where is the remote control?", "It's on the sofa.", ["I like apples.", "She is kind.", "He has a bike."]),
            ("Where did you put the umbrella?", "I left it in the hallway.", ["I am twelve.", "She likes red.", "He plays."]),
            ("Where are the scissors?", "They're in the top drawer.", ["I have a dog.", "She runs.", "He sings."]),
            ("Where is your phone?", "It's in my pocket.", ["I like music.", "She reads.", "He sleeps."]),
            ("Where can I find the stapler?", "It's on the teacher's desk.", ["I like pizza.", "She swims.", "He eats."]),
        ],
        [
            ("Whose backpack is this?", "It's mine.", ["I am fine.", "She is tall.", "He plays soccer."]),
            ("Is this your pencil case?", "No, it's hers.", ["I like cats.", "He runs.", "We eat."]),
            ("This book belongs to ___.", "him", ["her book", "they", "our"]),
            ("Are these your gloves?", "Yes, they're ours.", ["I have a pen.", "She sings.", "He reads."]),
            ("Whose turn is it?", "It's yours.", ["I like blue.", "She swims.", "He jumps."]),
        ],
    ],
    "int2c": [
        [
            ("What's your favorite season?", "I love autumn because of the colors.", ["I am twelve.", "He plays soccer.", "She has a cat."]),
            ("Why do you like summer?", "Because I can swim.", ["I like red.", "He reads.", "We eat."]),
            ("Which season is cold and snowy?", "Winter.", ["Spring", "I am fine.", "He runs."]),
            ("What is spring like?", "Flowers bloom and it gets warmer.", ["I have homework.", "She sings.", "He sleeps."]),
            ("Which season do you dislike?", "I don't like the rainy season.", ["I like pizza.", "She swims.", "He jumps."]),
        ],
        [
            ("What are you doing right now?", "I'm reading a book.", ["I am eleven.", "It is sunny.", "She is tall."]),
            ("What is she doing?", "She's cooking dinner.", ["I like blue.", "He plays.", "We study."]),
            ("Are they playing soccer?", "Yes, they are.", ["I have a dog.", "She runs.", "He sings."]),
            ("What are the kids doing?", "They're drawing pictures.", ["I like music.", "She reads.", "He eats."]),
            ("What is he doing on the phone?", "He's talking to his mom.", ["I like summer.", "She swims.", "He jumps."]),
        ],
        [
            ("Whose jacket is on the chair?", "It's Jake's.", ["I am fine.", "She is kind.", "He plays."]),
            ("Is this your umbrella?", "No, it's Maria's.", ["I like cats.", "He runs.", "We eat."]),
            ("Whose notebook is this?", "I think it's ours.", ["I have a pen.", "She sings.", "He reads."]),
            ("This is ___ bike.", "her", ["she", "herself", "she's"]),
            ("Whose phone is ringing?", "It's his.", ["I like red.", "She swims.", "He jumps."]),
        ],
        [
            ("What do you like to eat?", "I like Korean food.", ["I am ten.", "He is tall.", "She has a dog."]),
            ("Do you like playing games?", "Yes, I love them.", ["I like blue.", "He runs.", "We study."]),
            ("What does she like to do?", "She likes dancing.", ["I have a cat.", "He sings.", "He sleeps."]),
            ("What kind of music do you like?", "I like pop music.", ["I like pizza.", "She reads.", "He eats."]),
            ("Does he like vegetables?", "Not really.", ["I am fine.", "She swims.", "He jumps."]),
        ],
        [
            ("How are you feeling today?", "I'm a little nervous.", ["I like apples.", "He plays.", "She has a cat."]),
            ("She looks sad. What should you say?", "Are you okay?", ["I am twelve.", "He runs.", "We eat."]),
            ("How did he feel after the test?", "He felt relieved.", ["I like red.", "She sings.", "He reads."]),
            ("Are you excited about the trip?", "Yes, I'm thrilled!", ["I have homework.", "She swims.", "He jumps."]),
            ("Why does she seem angry?", "Maybe she's upset about the game.", ["I like music.", "He sleeps.", "We study."]),
        ],
        [
            ("What's wrong?", "My throat hurts.", ["I like pizza.", "She is kind.", "He has a bike."]),
            ("Where does it hurt?", "My stomach hurts.", ["I am fine.", "She runs.", "He sings."]),
            ("Do you have a fever?", "Yes, a little.", ["I like blue.", "She reads.", "He plays."]),
            ("How do you feel?", "I feel dizzy.", ["I have a dog.", "She swims.", "He eats."]),
            ("What should you do when you're sick?", "I should rest and drink water.", ["I like summer.", "She jumps.", "He runs."]),
        ],
        [
            ("Phone: Hello?", "Hi, this is Jay. Is Minji there?", ["I like cats.", "She is tall.", "He plays."]),
            ("Can I speak to Mr. Lee?", "Hold on, please.", ["I am ten.", "She sings.", "He reads."]),
            ("Sorry, wrong number.", "That's okay. Goodbye.", ["I like red.", "She swims.", "He jumps."]),
            ("I'll call you back later.", "Sure, talk to you soon.", ["I have a pen.", "She eats.", "He runs."]),
            ("Who is calling?", "This is Sora from class.", ["I like music.", "He sleeps.", "We study."]),
        ],
        [
            ("See you tomorrow!", "See you!", ["I am hungry.", "She is kind.", "He has a bike."]),
            ("I have to go now.", "Okay, take care!", ["I like blue.", "She runs.", "He sings."]),
            ("Goodbye! Have a nice weekend!", "You too!", ["I have a cat.", "She reads.", "He plays."]),
            ("It was nice talking to you.", "Likewise!", ["I like pizza.", "She swims.", "He eats."]),
            ("Bye! Drive safely.", "Thanks, bye!", ["I am fine.", "She jumps.", "He runs."]),
        ],
    ],
    "int3a": [
        [
            ("What is she doing in art class?", "She is drawing a flower.", ["She is running.", "She is cooking.", "She is sleeping."]),
            ("Choose the best sentence.", "I like to draw animals.", ["I like draw animals.", "I drawing animals.", "I likes to draw."]),
            ("What did he draw?", "He drew a mountain.", ["He draw a mountain.", "He drawing mountain.", "He draws mountain yesterday."]),
            ("Can you draw a map?", "Yes, I can draw a simple one.", ["I am twelve.", "She is tall.", "He plays."]),
            ("What are they drawing?", "They're drawing their families.", ["I like red.", "He runs.", "We eat."]),
        ],
        [
            ("What do you think of this idea?", "I think it's great.", ["I am fine.", "She is kind.", "He has a bike."]),
            ("Do you agree with them?", "I'm not sure yet.", ["I like cats.", "He runs.", "We study."]),
            ("What's your opinion?", "In my opinion, we should wait.", ["I have a pen.", "She sings.", "He reads."]),
            ("How do you feel about the plan?", "I think we need more time.", ["I like blue.", "She swims.", "He jumps."]),
            ("Do you think it's fair?", "Yes, I think so.", ["I like pizza.", "She eats.", "He sleeps."]),
        ],
        [
            ("What is the opposite of 'hot'?", "cold", ["warm", "spicy", "bright"]),
            ("Choose the opposite of 'big'.", "small", ["tall", "wide", "long"]),
            ("What is the opposite of 'happy'?", "sad", ["glad", "fun", "kind"]),
            ("The opposite of 'fast' is ___.", "slow", ["quick", "soon", "early"]),
            ("What is the opposite of 'clean'?", "dirty", ["neat", "fresh", "clear"]),
        ],
        [
            ("How old are you?", "I'm twelve years old.", ["I am fine.", "I like blue.", "I go to school."]),
            ("How old is your brother?", "He's fifteen.", ["He is tall.", "He likes soccer.", "He has a dog."]),
            ("When is your birthday?", "It's in March.", ["I like pizza.", "She sings.", "He runs."]),
            ("How old are they?", "They're ten.", ["They play.", "They eat.", "They study."]),
            ("Is she older than you?", "Yes, she's one year older.", ["I have a cat.", "He reads.", "We swim."]),
        ],
        [
            ("What is this insect?", "It's a butterfly.", ["It's a bird.", "It's a fish.", "It's a dog."]),
            ("Which one is a beetle?", "The shiny black bug.", ["The yellow flower.", "The green leaf.", "The blue sky."]),
            ("What do we call a small jumping insect?", "a grasshopper", ["a dolphin", "a rabbit", "a turtle"]),
            ("An ant is a kind of ___.", "insect", ["mammal", "fish", "bird"]),
            ("Which bug makes honey?", "a bee", ["a spider", "a worm", "a snail"]),
        ],
        [
            ("Good morning!", "Good morning! How are you?", ["Good night.", "See you.", "I'm twelve."]),
            ("Hello, nice to meet you.", "Nice to meet you too.", ["I like red.", "He plays.", "She runs."]),
            ("How have you been?", "I've been well, thanks.", ["I am hungry.", "It is cold.", "She has a cat."]),
            ("Long time no see!", "Yeah, it's been a while!", ["I like blue.", "He sings.", "We eat."]),
            ("Hi there!", "Hi! How's it going?", ["I have homework.", "She swims.", "He jumps."]),
        ],
        [
            ("What are you doing at the gym?", "I'm lifting weights.", ["I am reading.", "I am cooking.", "I am sleeping."]),
            ("Do you exercise every day?", "I try to exercise three times a week.", ["I like pizza.", "She is kind.", "He has a bike."]),
            ("What sport do you play?", "I play basketball.", ["I like cats.", "He runs home.", "We eat lunch."]),
            ("Are you stretching?", "Yes, before we run.", ["I am ten.", "She sings.", "He reads."]),
            ("Why do you exercise?", "To stay healthy.", ["I like red.", "She swims.", "He jumps."]),
        ],
        [
            ("Tell me about yourself.", "I'm Jay and I love teaching English.", ["I like apples.", "She is tall.", "He plays."]),
            ("Where are you from?", "I'm from Tongyeong, Korea.", ["I am fine.", "She runs.", "He sings."]),
            ("What do you like to do?", "I like reading and swimming.", ["I have a dog.", "She reads.", "He sleeps."]),
            ("Introduce yourself briefly.", "Hi, I'm Sora. I'm in grade six.", ["I like blue.", "She swims.", "He eats."]),
            ("What makes you unique?", "I'm good at helping friends study.", ["I like music.", "He jumps.", "We study."]),
        ],
    ],
    "int3b": [
        [
            ("What grade are you in?", "I'm in the sixth grade.", ["I am fine.", "I like red.", "I have a cat."]),
            ("Which grade is he in?", "He's in the fourth grade.", ["He is tall.", "He plays.", "He eats."]),
            ("Are you in middle school?", "Yes, I'm in seventh grade.", ["I like blue.", "She sings.", "He runs."]),
            ("What grade comes after fifth?", "Sixth grade.", ["Fourth grade", "I am ten.", "He sleeps."]),
            ("She is in ___.", "third grade", ["three grade", "grade three school", "the grade three"]),
        ],
        [
            ("True or false: The sun rises in the west.", "False", ["True", "Maybe", "Sometimes"]),
            ("Is this correct? 'She don't like apples.'", "No, that's wrong.", ["Yes, correct.", "I am fine.", "He plays."]),
            ("True or false: Water boils at 100°C.", "True", ["False", "I don't know.", "She sings."]),
            ("Which sentence is correct?", "They are students.", ["They is students.", "They am students.", "They be students."]),
            ("Is 'He go to school' correct?", "No, it should be 'He goes to school.'", ["Yes, perfect.", "I like red.", "She runs."]),
        ],
        [
            ("Which is bigger?", "An elephant is bigger than a mouse.", ["A mouse is bigger.", "They are same.", "I am twelve."]),
            ("Choose the comparative.", "This book is more interesting than that one.", ["more interestinger", "interestinger", "most interesting"]),
            ("Who is taller?", "Minho is taller than Jay.", ["Jay is taller.", "Same height.", "I like blue."]),
            ("Which city is more crowded?", "Seoul is more crowded than Tongyeong.", ["Tongyeong is more.", "Equal.", "He plays."]),
            ("This test is ___ than the last one.", "harder", ["more hard", "hardest", "hardly"]),
        ],
        [
            ("Who is that woman?", "She's my aunt.", ["I am fine.", "I like pizza.", "He runs."]),
            ("Do you know that man?", "No, I don't think so.", ["Yes, I am.", "She sings.", "He eats."]),
            ("Who are those children?", "They're new students.", ["I have a dog.", "She reads.", "He sleeps."]),
            ("Excuse me, who is she?", "That's our principal.", ["I like red.", "She swims.", "He jumps."]),
            ("Have you met him before?", "No, who's he?", ["I am ten.", "She is kind.", "He plays."]),
        ],
        [
            ("What should the teacher say?", "Please open your books.", ["I like cats.", "She is tall.", "He has a bike."]),
            ("Choose a polite command.", "Please sit down.", ["Sit down now!", "You sit.", "Sitting down."]),
            ("Tell them what to do.", "Don't run in the hallway.", ["I am fine.", "She sings.", "He reads."]),
            ("How do you ask someone to listen?", "Listen carefully, please.", ["I like blue.", "She swims.", "He eats."]),
            ("What is the teacher's instruction?", "Write your name at the top.", ["I have homework.", "She jumps.", "He runs."]),
        ],
        [
            ("Which one is a fruit?", "a strawberry", ["a carrot", "a potato", "a celery"]),
            ("What color is a banana?", "yellow", ["blue", "purple", "black"]),
            ("Choose a citrus fruit.", "an orange", ["an apple", "a grape", "a pear"]),
            ("Which fruit is small and purple?", "a grape", ["a melon", "a peach", "a coconut"]),
            ("What do we call this red fruit?", "a cherry", ["a bean", "a nut", "a leaf"]),
        ],
        [
            ("What does 'Don't forget' mean?", "Remember to do it.", ["Never do it.", "I am fine.", "She is kind."]),
            ("Don't forget your homework!", "I won't forget!", ["I am twelve.", "He plays.", "She runs."]),
            ("Remind me about the test.", "Don't forget — it's on Friday.", ["I like red.", "He sings.", "We eat."]),
            ("What should you say before a trip?", "Don't forget your passport.", ["I have a cat.", "She reads.", "He sleeps."]),
            ("Don't forget to ___.", "bring your lunch", ["forget your lunch", "lunch forget", "forgetting lunch"]),
        ],
        [
            ("Hello! Where are you from?", "I'm from Canada.", ["I am twelve.", "I like blue.", "She is kind."]),
            ("Nice to meet you!", "Nice to meet you too!", ["Goodbye.", "I am hungry.", "He runs."]),
            ("Do you speak Korean?", "A little.", ["I like pizza.", "She sings.", "He jumps."]),
            ("Welcome to Korea!", "Thank you! I'm excited to be here.", ["I have a dog.", "She reads.", "He sleeps."]),
            ("How long are you staying?", "For two weeks.", ["I like music.", "She swims.", "He eats."]),
        ],
    ],
    "int3c": [
        [
            ("Would you like some kimchi?", "Yes, I'd love some!", ["I am fine.", "He is tall.", "She has a cat."]),
            ("What food do you recommend?", "You should try bibimbap.", ["I like red.", "He runs.", "We study."]),
            ("This soup is delicious!", "I'm glad you like it.", ["I have a pen.", "She sings.", "He reads."]),
            ("Have you tried Korean pancakes?", "Not yet, but I want to.", ["I like blue.", "She swims.", "He jumps."]),
            ("What should we order?", "Let's get bulgogi and rice.", ["I am ten.", "She is kind.", "He plays."]),
        ],
        [
            ("What does 'Don't touch' mean?", "You shouldn't touch it.", ["Touch it quickly.", "I am fine.", "She runs."]),
            ("Don't run here!", "Sorry, I won't.", ["I like cats.", "He sings.", "We eat."]),
            ("Choose the best warning.", "Don't talk during the test.", ["Talk loudly.", "I have homework.", "She sleeps."]),
            ("What should the sign say?", "Don't feed the animals.", ["Feed the animals.", "I like pizza.", "He jumps."]),
            ("Don't ___ near the pool.", "run", ["running", "ran", "runs"]),
        ],
        [
            ("Can I borrow your eraser?", "Sure, here you go.", ["I am twelve.", "She is tall.", "He plays."]),
            ("May I go to the restroom?", "Yes, you may.", ["I like blue.", "He runs.", "We eat."]),
            ("Could I use your phone?", "Sorry, not right now.", ["I have a dog.", "She sings.", "He reads."]),
            ("Is it okay if I sit here?", "Of course.", ["I like red.", "She swims.", "He jumps."]),
            ("Do you mind if I open the window?", "No, go ahead.", ["I like music.", "He sleeps.", "We study."]),
        ],
        [
            ("Would you like to join us?", "Sure, that sounds fun!", ["I am fine.", "She is kind.", "He has a bike."]),
            ("Let's play soccer after school.", "Great idea!", ["I like cats.", "He runs home.", "We eat."]),
            ("Do you want to come to my party?", "Yes, I'd love to!", ["I have a pen.", "She sings.", "He reads."]),
            ("How about watching a movie?", "Okay, let's do it.", ["I like pizza.", "She swims.", "He eats."]),
            ("Shall we study together?", "Good plan!", ["I am ten.", "She jumps.", "He plays."]),
        ],
        [
            ("Do you have a pet?", "Yes, I have a hamster.", ["I am fine.", "She is tall.", "He runs."]),
            ("What do you have in your bag?", "I have books and a water bottle.", ["I like blue.", "He sings.", "We eat."]),
            ("She doesn't have ___.", "any brothers", ["some brother", "brother any", "any brotheres"]),
            ("Do they have homework?", "Yes, they have a lot.", ["I have a cat.", "She reads.", "He sleeps."]),
            ("I have to go now.", "Okay, see you later!", ["I like red.", "She swims.", "He jumps."]),
        ],
        [
            ("Where is Korea?", "It's in East Asia.", ["I am twelve.", "I like pizza.", "He plays."]),
            ("What is famous in Korea?", "K-pop and delicious food.", ["I have a dog.", "She sings.", "He runs."]),
            ("Tell me about Tongyeong.", "It's a beautiful coastal city.", ["I like blue.", "She reads.", "He eats."]),
            ("What language do Koreans speak?", "Korean", ["Korea", "Koreans", "Koreish"]),
            ("What do you like about Korea?", "I love the kind people and the scenery.", ["I am fine.", "She swims.", "He jumps."]),
        ],
        [
            ("Can you swim?", "Yes, I can.", ["I am ten.", "She is kind.", "He has a bike."]),
            ("Can she play the piano?", "No, she can't.", ["I like red.", "He runs.", "We study."]),
            ("___ you help me?", "Can", ["Do", "Are", "Is"]),
            ("What can birds do?", "They can fly.", ["They can drive.", "They can read.", "They can cook."]),
            ("Can we leave early?", "Sorry, we can't today.", ["I like cats.", "She sings.", "He reads."]),
        ],
        [
            ("What time is it?", "It's a quarter to five.", ["I am fine.", "She is tall.", "He plays."]),
            ("When does class start?", "It starts at nine o'clock.", ["I like blue.", "He runs.", "We eat."]),
            ("How do you say 3:30?", "Half past three.", ["Three past half.", "Thirty three.", "Half three past."]),
            ("What time do you eat dinner?", "Around seven p.m.", ["I have a cat.", "She sings.", "He sleeps."]),
            ("Is it ten o'clock yet?", "No, it's only nine forty-five.", ["I like pizza.", "She swims.", "He jumps."]),
        ],
    ],
}

COUNTS = {"unit": 30, "midterm_1_4": 30, "midterm_5_8": 30, "final": 35}
PREFIX = {"int2a": "i2a", "int2b": "i2b", "int2c": "i2c", "int3a": "i3a", "int3b": "i3b", "int3c": "i3c"}


def expand_bank(items, target):
    out = []
    i = 0
    while len(out) < target:
        out.append(items[i % len(items)])
        i += 1
    return out


def make_question(book, assess_kind, unit_num, qidx, tpl):
    prefix = PREFIX[book]
    aid = assess_kind
    if assess_kind == "unit":
        aid = f"u{unit_num:02d}"
    qid = f"{prefix}_{aid}_q{qidx:02d}"
    prompt, correct, wrongs = tpl
    choices = [correct] + list(wrongs)
    random.shuffle(choices)
    why = {c: "Not quite — try again!" for c in choices if c != correct}
    return {
        "id": qid,
        "type": 4 if "?" in prompt or prompt.startswith(("Phone:", "May I", "Can I", "Would you", "Hello", "Good", "See you", "Mom,", "Dad,", "Tell me", "What do you think", "How do you feel", "Do you agree", "Nice to meet", "Long time", "Hi there", "Hi,", "Who is", "Excuse me", "Have you met", "Welcome", "How long", "What should", "Remind me", "Don't forget", "Is it okay", "Do you mind", "Shall we", "How about", "Let's", "Sorry,", "I'll call")) else 2,
        "prompt_text": prompt,
        "audio_id": None,
        "image_ids": [],
        "choices": choices,
        "correct": correct,
        "why_wrong": why,
        "unit": unit_num if assess_kind == "unit" else None,
        "level": book,
    }


def write_pack(book, assess_id, kind, title, units_covered, count, bank_slices):
    questions = []
    qn = 1
    for slice_items in bank_slices:
        for tpl in expand_bank(slice_items, max(1, count // len(bank_slices))):
            if len(questions) >= count:
                break
            unit_num = units_covered[0] if kind != "unit" else int(assess_id.replace("unit", ""))
            questions.append(make_question(book, kind if kind == "unit" else assess_id, unit_num if kind == "unit" else (units_covered[qn % len(units_covered)] if units_covered else 1), qn, tpl))
            qn += 1
    questions = questions[:count]
    meta = {
        "level": book,
        "title": title,
        "kind": kind,
        "units_covered": units_covered,
        "count": len(questions),
        "schema": "id,type,prompt_text,audio_id,image_ids,choices,correct,why_wrong,unit,level",
        "types": {
            "1": "listen_pick_picture",
            "2": "listen_pick_word",
            "3": "picture_pick_word",
            "4": "dialog_pick_reply",
            "5": "cue_pick_english",
            "6": "spelling_pick",
            "7": "listen_pick_sentence",
        },
        "generated": True,
        "note": "Shell pack — replace with staging assets when available.",
    }
    path = os.path.join(ROOT, book, assess_id, "questions.json")
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump({"meta": meta, "questions": questions}, f, ensure_ascii=False, indent=2)
    return len(questions)


def main():
    random.seed(42)
    manifest_levels = []
    for book, info in BOOKS.items():
        assessments = []
        banks = UNIT_BANKS[book]
        label = info["label"]
        for u in range(1, 9):
            uid = f"unit{u:02d}"
            title = f"{label} Unit {u}: {info['units'][u - 1]}"
            n = write_pack(book, uid, "unit", title, [u], COUNTS["unit"], [banks[u - 1]])
            assessments.append({
                "id": uid,
                "path": f"{book}/{uid}/questions.json",
                "title": title,
                "kind": "unit",
                "count": n,
                "pass_percent": 80,
            })
        for mid, kind, units in [
            ("midterm_1_4", "midterm_1_4", [1, 2, 3, 4]),
            ("midterm_5_8", "midterm_5_8", [5, 6, 7, 8]),
        ]:
            title = f"{label} Midterm Units {units[0]}–{units[-1]}"
            n = write_pack(book, mid, kind, title, units, COUNTS[kind], [banks[u - 1] for u in units])
            assessments.append({
                "id": mid,
                "path": f"{book}/{mid}/questions.json",
                "title": title,
                "kind": kind,
                "count": n,
                "pass_percent": 80,
            })
        title = f"{label} Final Exam"
        n = write_pack(book, "final", "final", title, list(range(1, 9)), COUNTS["final"], banks)
        assessments.append({
            "id": "final",
            "path": f"{book}/final/questions.json",
            "title": title,
            "kind": "final",
            "count": n,
            "pass_percent": 80,
        })
        manifest_levels.append({"id": book, "label": label, "assessments": assessments})
    manifest_path = os.path.join(ROOT, "data", "manifest-intermediate.json")
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump({"levels": manifest_levels}, f, ensure_ascii=False, indent=2)
    print(f"Wrote {len(manifest_levels)} books to {manifest_path}")


if __name__ == "__main__":
    main()
