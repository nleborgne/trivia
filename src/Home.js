import React from 'react';
import FormGroup from 'react-bootstrap/FormGroup';
import FormLabel from 'react-bootstrap/FormLabel';
import FormControl from 'react-bootstrap/FormControl';
import Clock from './Clock';

class Home extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      choicesDifficulty: ['Any','Easy','Medium','Hard'],
      difficulty: 'any',
      questions: null,
      answeredQuestions: 0,
      answers: [],
      results:[],
      time: 0,
      isRandomized: false,
    }
  }

  componentDidUpdate() {
    if(!this.state.isRandomized && this.state.questions && this.state.answeredQuestions < this.state.questions.length) {
      this.setState({
        qAnswers: this.getAnswers(),
        isRandomized:true,
      })
    }
  }

  startTimer() {

    this.timer = setInterval(() => this.setState({
      time: this.state.time + 1
    }), 1000)

    }

  stopTimer() {
    clearInterval(this.timer);
  }

  shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;
    while (0 !== currentIndex) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    };

  return array;
}

  decodeHTML(text) {
    return (
      text
      .replace(/&quot;/g,'"')
      .replace(/&#039;/g,"'")
      .replace(/&ldquo;/g,"“")
      .replace(/&rdquo;/g,"”")
      .replace(/&amp;/g,'&')
      .replace(/&eacute;/g,'é')
      .replace(/&rsquo;/g, "'")
      .replace(/&ocirc;/g, 'ô')
      .replace(/&shy;/g,"-")
    )
  }

  changeDifficulty(e) {
    this.setState({
      difficulty: e.target.value,
    })
  }

  checkAnswer(e, question) {
    let userInput;
    for (let answer of e) {
      if (answer.checked) {
        userInput = answer.value;
      }
    }

    let result = null;
    (this.decodeHTML(userInput) === this.decodeHTML(question.correct_answer)) ? result = true : result = false;
    let newResults = this.state.results;
    let alreadyAnswered = this.state.answeredQuestions;
    let previousAnswers = this.state.answers;
    newResults = newResults.concat(result);
    previousAnswers = previousAnswers.concat(userInput);
    this.setState({
      results: newResults,
      answeredQuestions: alreadyAnswered + 1,
      answers: previousAnswers,
      isRandomized: false,
      score: 0,
      answer: '',
    });
  }

  getQuestions() {
    let difficulty = '';
    (this.state.difficulty === 'any') ? difficulty = '' : difficulty = '&difficulty='+this.state.difficulty ;
    let url = 'https://opentdb.com/api.php?amount=10&type=multiple'+difficulty;
    fetch(url)
    .then((response) => {
      response.json().then((data) => {
        this.setState({
          questions:data.results,
        });
      });
    }, this.startTimer());
  }


  getAnswers() {
    let currentIndex = this.state.answeredQuestions;
    let currentQuestion = this.state.questions[currentIndex];
    let answers = [];
    for (let answer of currentQuestion.incorrect_answers) {
      answers.push(<div key={this.decodeHTML(answer)} className="radiobtn"><input type="radio" className="mr-3 mb-3" key={this.decodeHTML(answer)} name={currentQuestion.question} variant="secondary" id={this.decodeHTML(answer)} value={this.decodeHTML(answer)} onClick={(e) => this.setState({answer:e.target.value})}/><label for={this.decodeHTML(answer)}>{this.decodeHTML(answer)}</label></div>);
    }
    answers.push(<div key={this.decodeHTML(currentQuestion.correct_answer)} className="radiobtn"><input type="radio" className="mr-3 mb-3" key={this.decodeHTML(currentQuestion.correct_answer)} name={currentQuestion.question} variant="secondary" id={this.decodeHTML(currentQuestion.correct_answer)} value={this.decodeHTML(currentQuestion.correct_answer)} onClick={(e) => this.setState({answer:e.target.value})} /><label for={this.decodeHTML(currentQuestion.correct_answer)}>{this.decodeHTML(currentQuestion.correct_answer)}</label></div>);

    if(!this.state.isRandomized) {
      answers = this.shuffle(answers);

      this.setState({
        isRandomized: true,
      })
    }

    return answers;
  }

  render() {
    let choicesDifficulty = [];
    for (let choice of this.state.choicesDifficulty) {
      choicesDifficulty.push(<option key={choice} value={choice.toLowerCase()}>{choice}</option>);
    }
    if(this.state.questions === null) {
      return(
      <div className="App">
        <header className="App-header mt-5">
          <div className="text-center">
            <FormGroup className="col-sm-10 col-lg-3 mx-auto mt-5 shadow p-4" id="container">
              <FormLabel className="text-dark">Select difficulty</FormLabel>
              <FormControl as="select" onChange={ (e) => this.changeDifficulty(e)}>
                {choicesDifficulty}
              </FormControl>
              <button className="button mt-5 px-5 rounded-pill py-2" onClick={ () => this.getQuestions()}>Start</button>
            </FormGroup>
          </div>
        </header>
      </div>
    )
  } else if(this.state.results.length < this.state.questions.length){

    let currentQuestion = this.state.questions[this.state.answeredQuestions];

      return (
        <div class="mt-5 col-sm-12 col-lg-6 mx-auto p-4 text-center shadow " id="container">
          <div class="row mb-4">
            <h4 class="float-lg-left mr-auto text-center mx-auto">Question : {this.state.answeredQuestions + 1} / 10 </h4>
            <h4 class="float-lg-right ml-auto text-center mx-auto">Category : {this.decodeHTML(currentQuestion.category)}</h4>
          </div>
          <h4 className="text-center">{this.decodeHTML(currentQuestion.question)}</h4>
          <div className="mx-auto text-center mt-3 col-sm-12 col-lg-6">{this.state.qAnswers}</div>
          <button className="button mt-5 px-5 rounded-pill py-2" onClick={ () => this.checkAnswer(document.getElementsByName(currentQuestion.question), currentQuestion) } disabled={!this.state.answer}><i class="fas fa-angle-right"></i>&nbsp;Next</button>
          <Clock time={this.state.time} />
        </div>
      )
    } else {
      this.stopTimer();
      let showResults = [];
      let correctAnswers = this.state.results.filter(x => x === true).length;

      for (let i = 0; i < this.state.questions.length; i++) {
        let questionTitle = this.decodeHTML(this.state.questions[i].question);
        if(this.state.results[i] === true) {
          let answer = this.decodeHTML(this.state.questions[i].correct_answer);
          showResults.push(<div><h4 class="">{questionTitle}</h4><p className="text-success">Correct</p><p className="">Answer : {this.decodeHTML(answer)}</p></div>);
        } else {
          let answer = this.decodeHTML(this.state.questions[i].correct_answer);
          showResults.push(<div><h4 class="">{questionTitle}</h4><p className="text-danger">Incorrect</p><p class="">Your answer : {this.decodeHTML(this.state.answers[i])}</p><p className="">Answer : {this.decodeHTML(answer)}</p></div>);
        }
      }

      return(
        <div className="mt-5 text-center">
          <div id="container" className="col-sm-12 col-lg-4 py-3 mx-auto">
            <p>YOUR SCORE</p>
            <p class="score">{correctAnswers}</p>
            <p>Total questions : {this.state.questions.length}</p>
            <p>Correct answers : {correctAnswers}</p>
            <p>Time : {this.state.time} seconds</p>
          </div>
          <div id="container" className="my-5 col-sm-12 col-lg-4 mx-auto py-4">
            {showResults}
          </div>
        </div>
      )
    }

  };
}

export default Home;
