import React from 'react';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import FormGroup from 'react-bootstrap/FormGroup';
import FormLabel from 'react-bootstrap/FormLabel';
import FormControl from 'react-bootstrap/FormControl';
import './App.css';


class Home extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      choicesDifficulty: ['Any','Easy','Medium','Hard'],
      difficulty: '',
      questions: null,
      answeredQuestions: 0,
      results:[]
    }
  }

  shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;
  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

  decodeHTML(text) {
    return (
      text.replace(/&quot;/g,'"').replace(/&#039;/g,"'").replace(/&ldquo;/g,"“").replace(/&rdquo;/g,"”").replace(/&amp;/g,'&').replace(/&eacute;/g,'é')
    )
  }

  changeDifficulty(e) {
    this.setState({
      difficulty: e.target.value,
    })
  }

  checkAnswer(e, question) {
    let result = null;
    (e.target.value === question.correct_answer) ? result = true : result = false;
    this.state.answeredQuestions++;
    let newResults = this.state.results.concat(result);
    this.setState({
      results: newResults,
    });
  }

  getQuestions() {
    let difficulty;
    (this.state.difficullty !== '') ? difficulty = '&difficulty='+this.state.difficulty : difficulty = '';
    fetch('https://opentdb.com/api.php?amount=10&type=multiple'+difficulty)
    .then((response) => {
      response.json().then((data) => {
        this.setState({
          questions:data.results,
        });
      });
    });
  }

  render() {
    let test = [];
    for (let choice of this.state.choicesDifficulty) {
      test.push(<option key={choice} value={choice.toLowerCase()}>{choice}</option>);
    }
    if(this.state.questions === null) {
      return(
      <div className="App">
        <header className="App-header mt-5">
          <div className="text-center">
            <FormGroup className="col-3 mx-auto mt-5">
              <FormLabel className="text-light">Select difficulty</FormLabel>
              <FormControl as="select" onChange={ (e) => this.changeDifficulty(e)}>
                {test}
              </FormControl>
              <Button className="mt-5 px-5 rounded-pill py-2  " onClick={ () => this.getQuestions()}>Start</Button>
            </FormGroup>
          </div>
        </header>
      </div>
    )
  } else if(this.state.results.length < this.state.questions.length){
    let currentQuestion = this.state.questions[this.state.answeredQuestions];
    let answers = [];
    for (let answer of currentQuestion.incorrect_answers) {
      answers.push(<Button className="mr-3" variant="light" onClick={ (e) => this.checkAnswer(e, currentQuestion) } value={this.decodeHTML(answer)}>{this.decodeHTML(answer)}</Button>);
    }
    answers.push(<Button className="mr-3" variant="light" onClick={ (e) => this.checkAnswer(e, currentQuestion) } value={this.decodeHTML(currentQuestion.correct_answer)}>{this.decodeHTML(currentQuestion.correct_answer)}</Button>);
    answers = this.shuffle(answers);
      return (
        <div class="mt-5">
          <h4 class="text-light text-center">Question : {this.state.answeredQuestions + 1} / 10 </h4>
          <h4 className="text-center text-light">{this.decodeHTML(currentQuestion.question)}</h4>
          <div className="mx-auto text-center mt-3">{answers}</div>
        </div>
      )
    } else {
      let showResults = [];
      let correctAnswers = this.state.results.filter(x => x === true).length;

      for (let i = 0; i < this.state.questions.length; i++) {
        let questionTitle = this.decodeHTML(this.state.questions[i].question);
        if(this.state.results[i] === true) {
          let answer = this.decodeHTML(this.state.questions[i].correct_answer);
          showResults.push(<div><h4 className="text-light">{questionTitle}</h4><p className="text-success">Correct</p><p className="text-light">Answer : {answer}</p></div>);
        } else {
          let answer = this.decodeHTML(this.state.questions[i].correct_answer);
          showResults.push(<div><h4 className="text-light">{questionTitle}</h4><p className="text-danger">Incorrect</p><p className="text-light">Answer : {answer}</p></div>);
        }
      }

      return(
        <div className="mt-5 text-center">
          <h4 className="text-light mb-5">Score : {correctAnswers} / {this.state.questions.length}</h4>
          {showResults}
        </div>
      )
    }

  };
}

export default Home;
